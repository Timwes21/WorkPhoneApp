import asyncio
import base64
import json
import websockets
import os
import inspect
from dotenv import load_dotenv
from utils.functions import FUNCTION_MAP
from fastapi import WebSocket
from utils.query import get_retriever
from langchain.chains.retrieval_qa.base import RetrievalQA
from utils.llm import llm
from utils.config import get_config
from utils.const import DefaultSettings



load_dotenv()

ask_docs_function_call = {
                "name": "ask_docs",
                "description": "gets an answer from asking document using a customm built rag",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "the question needed for getting the required info from the document store"
                        }
                    },
                    "required": ["query"]
                }
             }

    

class DGWS:
    def __init__(self, files_collection):
        self.files_collection = files_collection
        self.qa = None
        self.functions = FUNCTION_MAP
        self.call_logs = []
        self.call_over = False

    async def ask_docs(self, query: str):
        res = await self.qa.ainvoke(query)
        results: str = res['result']
        print("****Results from FAISS: ", results, "\n")

        return results.replace("*", "")


    def sts_connect(self):
        api_key = os.getenv("DEEPGRAM_API_KEY")
        if not api_key:
            raise Exception("DEEPGRAM_API_KEY not found")

        sts_ws = websockets.connect(
            "wss://agent.deepgram.com/v1/agent/converse",
            subprotocols=["token", api_key]
        )


        return sts_ws


    def load_config(self, greeting, prompt):
        init_session = get_config(greeting, prompt)
        if self.qa:
            print("Getting the function")
            init_session["agent"]["think"]["functions"].append(ask_docs_function_call)
        else:
            print("no function to get")
        return init_session


    async def handle_barge_in(self, decoded, twilio_ws: WebSocket, streamsid):
        if decoded["type"] == "UserStartedSpeaking":
            clear_message = {
                "event": "clear",
                "streamSid": streamsid
            }
            await twilio_ws.send_json(clear_message)


    def execute_function_call(self, func_name, arguments):
        if func_name in self.functions:
            result = self.functions[func_name](**arguments)
            print(f"Function call result: {result}")      
            return result
        else:
            result = {"error": f"Unknown function: {func_name}"}
            print(result)
            return result


    def create_function_call_response(self, func_id, func_name, result):
        print("in create funciton call request")
        return {
            "type": "FunctionCallResponse",
            "id": func_id,
            "name": func_name,
            "content": json.dumps(result)
        }


    async def handle_function_call_request(self, decoded, sts_ws):
        try:
            for function_call in decoded["functions"]:

                func_name = function_call["name"]
                func_id = function_call["id"]
                arguments = json.loads(function_call["arguments"])

                print(f"Function call: {func_name} (ID: {func_id}), arguments: {arguments}")

                result = self.execute_function_call(func_name, arguments)
                if inspect.isawaitable(result):
                    result = await result

                function_result = self.create_function_call_response(func_id, func_name, result)
                await sts_ws.send(json.dumps(function_result))
                print(f"Sent function result: {function_result}")

        except Exception as e:
            print(f"Error calling function: {e}")
            error_result = self.create_function_call_response(
                func_id if "func_id" in locals() else "unknown",
                func_name if "func_name" in locals() else "unknown",
                {"error": f"Function call failed with: {str(e)}"}
            )
            await sts_ws.send(json.dumps(error_result))


    async def handle_text_message(self, decoded, twilio_ws: WebSocket, sts_ws, streamsid):
        await self.handle_barge_in(decoded, twilio_ws, streamsid)

        if decoded["type"] == "FunctionCallRequest":
            print("function call")
            task = asyncio.create_task(self.handle_function_call_request(decoded, sts_ws))
            await task


    async def sts_sender(self, sts_ws, audio_queue):
        while not self.call_over:
            chunk = await audio_queue.get()
            await sts_ws.send(chunk)


    async def sts_receiver(self, sts_ws, twilio_ws: WebSocket, streamsid_queue: asyncio.Queue):
        streamsid = await streamsid_queue.get()

        async for message in sts_ws:
            if self.call_over:
                break
            if type(message) is str:
                decoded = json.loads(message)
                if decoded["type"] == "ConversationText":
                    self.call_logs.append({"role": decoded["role"], "text": decoded["content"]})
                await self.handle_text_message(decoded, twilio_ws, sts_ws, streamsid)
                continue
            raw_mulaw = message

            media_message = {
                "event": "media",
                "streamSid": streamsid,
                "media": {"payload": base64.b64encode(raw_mulaw).decode("ascii")}
            }
            await twilio_ws.send_json(media_message)


    async def twilio_receiver(self, twilio_ws: WebSocket, audio_queue, streamsid_queue):
        BUFFER_SIZE = 160
        inbuffer = bytearray(b"")

        async for message in twilio_ws.iter_text():
            try:
                data = json.loads(message)
                event = data["event"]

                if event == "start":
                    print("get our streamsid")
                    start = data["start"]
                    streamsid = start["streamSid"]
                    streamsid_queue.put_nowait(streamsid)
                elif event == "connected":
                    continue
                elif event == "media":
                    media = data["media"]
                    chunk = base64.b64decode(media["payload"])
                    if media["track"] == "inbound":
                        audio_queue.put_nowait(chunk)
                        # inbuffer.extend(chunk)
                elif event == "stop":
                    self.call_over = True
                    print("the event is stop")
                    break


                while len(inbuffer) >= BUFFER_SIZE:
                    chunk = inbuffer[:BUFFER_SIZE]
                    audio_queue.put_nowait(chunk)
                    inbuffer = inbuffer[BUFFER_SIZE:]
            except Exception as e:
                print(e)
                break


    async def start(self, websocket, user):
        clerk_sub = user["clerk_sub"]
        res_files = await self.files_collection.find_one({"clerk_sub": clerk_sub})

        files = res_files.get('files', [])

        retriever = await get_retriever(clerk_sub, files)
        
        if retriever == None:
            print("No files match\n")
        else:
            self.qa = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)
            self.functions["ask_docs"] = self.ask_docs
            print("user has files\n")

        audio_queue = asyncio.Queue()
        streamsid_queue = asyncio.Queue()

        async with self.sts_connect() as sts_ws:
            greeting = user.get("greeting_message", DefaultSettings.greeting_message(user.get("name", "your party")))
            prompt = user.get("ai_prompt", DefaultSettings.ai_prompt)
            config = self.load_config(greeting, prompt)
            await sts_ws.send(json.dumps(config))
            
            tasks = [
                    asyncio.ensure_future(self.sts_sender(sts_ws, audio_queue)),
                    asyncio.ensure_future(self.sts_receiver(sts_ws, websocket, streamsid_queue)),
                    asyncio.ensure_future(self.twilio_receiver(websocket, audio_queue, streamsid_queue)),
                ]

            _, pending_tasks = await asyncio.wait(
                tasks,
                return_when=asyncio.FIRST_COMPLETED
            )

        for i in pending_tasks:
            i.cancel()

        print("after the futures")

        return {"call_logs": self.call_logs, "clerk_sub": res_files["clerk_sub"], "time_zone": user.get("time_zone", DefaultSettings.time_zone)}

