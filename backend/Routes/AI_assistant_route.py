from fastapi import APIRouter, WebSocket, Request, WebSocketDisconnect
from utils.call_choice import dial_agent, dial_person, blocked_number
from utils.query import ask_document
from langchain.chains.retrieval_qa.base import BaseRetrievalQA
from utils.deepgram_ws import DGWS
import os

OPENAI_API_KEY = os.getenv('OPENAI_KEY')

router = APIRouter()


@router.api_route("/incoming-call/{webhook_token}", methods=["GET", "POST"])
async def handle_incoming_call(request: Request, webhook_token: str):
    print("***in incoming-call route***")
    user: dict = await request.app.state.user_info_collection.find_one({"webhook_token": webhook_token})
    form = await request.form()
    callsid = form.get("From", "")
    if callsid in user.get("blocked_numbers", []):
        return blocked_number(user)
    return dial_person(webhook_token, user)

@router.post("/get-call-status/{webhook_token}")
async def call_status(request: Request, webhook_token: str):
    print("***In get-call-status route**")
    body: bytes = await request.body()
    body: str = body.decode()
    body = {i.split("=")[0]: i.split("=")[1] for i in body.split("&")}
        
    user = await request.app.state.user_info_collection.find_one({"webhook_token": webhook_token}, {"_id": 0})

    if body["DialCallStatus"] != "completed" and user["plan"] != "free":
        return await dial_agent(request, user)
    


@router.websocket("/media-stream/{webhook_token}")
async def handle_media_stream(websocket: WebSocket, webhook_token: str):
    """Handle WebSocket connections between Twilio and OpenAI"""
    await websocket.accept()
    try:
        user_info_collection = websocket.app.state.user_info_collection
        files_collection = websocket.app.state.docs_collection
        call_log_collection = websocket.app.state.call_log_collection

        deepgram = DGWS(user_info_collection, call_log_collection, files_collection)
        call_logs, clerk_sub = await deepgram.start(websocket, webhook_token)
        call_log_collection.update_one({"clerk_sub": clerk_sub}, {"$push": {"logs": call_logs}})
        


        websocket.close()

    except WebSocketDisconnect as e:
        print(e)
    




@router.get("/get-call-logs")
async def get_call_logs(request: Request, offset: int = 0, limit: int = 20):
    clerk_sub = request.app.state.decode_token(request)
    collection = request.app.state.call_log_collection
    query = {"clerk_sub", clerk_sub}
    project = {"_id": 0, "logs": {"$slice": [offset, limit]}}

    res = await collection.find_one(query, project)

    logs = res.get("logs", [])
    next_offset = offset + len(logs) if len(logs) == limit else None

    return {"items": logs, "next_offset": next_offset}
