from fastapi import APIRouter, WebSocket, Request, WebSocketDisconnect
from utils.call_choice import dial_agent, dial_person, blocked_number
from utils.query import ask_document
from langchain.chains.retrieval_qa.base import BaseRetrievalQA
from utils.deepgram_ws import DGWS
from datetime import datetime
import os

OPENAI_API_KEY = os.getenv('OPENAI_KEY')

router = APIRouter()


@router.api_route("/incoming-call/{webhook_token}", methods=["GET", "POST"])
async def handle_incoming_call(request: Request, webhook_token: str):
    print("***in incoming-call route***")
    user: dict = await request.app.state.user_info_collection.find_one({"webhook_token": webhook_token})
    form = await request.form()
    callsid = form.get("From", "")
    for i in user.get("blocked_numbers", []):
        if i in callsid: 
            return blocked_number(user)
    print("not blocked")
    if user["real_number"] in callsid:
        return dial_agent(request, user, callsid)
    print("not the user")
    return dial_person(webhook_token, user, callsid)

@router.post("/get-call-status/{webhook_token}/{callsid}")
async def call_status(request: Request, webhook_token: str, callsid: str):
    print("***In get-call-status route**")
    body: bytes = await request.body()
    body: str = body.decode()
    body = {i.split("=")[0]: i.split("=")[1] for i in body.split("&")}
        
    user = await request.app.state.user_info_collection.find_one({"webhook_token": webhook_token}, {"_id": 0})

    if body["DialCallStatus"] != "completed" and user.get("plan") != "free":
        return dial_agent(request, user, callsid)
    


@router.websocket("/media-stream/{webhook_token}/{callsid}")
async def handle_media_stream(websocket: WebSocket, webhook_token: str, callsid: str):
    """Handle WebSocket connections between Twilio and OpenAI"""
    await websocket.accept()
    try:
        user_info_collection = websocket.app.state.user_info_collection
        files_collection = websocket.app.state.docs_collection
        call_log_collection = websocket.app.state.call_log_collection

        deepgram = DGWS(user_info_collection, call_log_collection, files_collection)
        call_completed: dict = await deepgram.start(websocket, webhook_token)
        print("code was executed")
        
        clerk_sub = call_completed["clerk_sub"]
        call_logs = call_completed["call_logs"]

        now = datetime.now()
        day = now.strftime("%B; %d; %Y; %H:%M")
        month, day, year, time = day.split(";")
        hours, minutes = time.split(":")
        hours = int(hours)
        if hours > 12:
            hours -= 12 
            setting = "pm"
        else:
            setting = "am"
            if hours == 0:
                hours = 12




        call = {
            "callsid": callsid,
            "date": {
                "month": month[:3],
                "day": day,
                "year": year,
                "time": f"{hours}:{minutes}{setting}"
            },
            "transcript": call_logs,


        }
        call_log_collection.update_one({"clerk_sub": clerk_sub}, {"$push": {"logs": call}})
        
        


        await websocket.close()
        print("websocket has been closed")

    except WebSocketDisconnect as e:
        print(e)
    




@router.get("/get-call-logs/{page}")
async def get_call_logs(request: Request, page: int):
    display_number = 15
    start = page * display_number
    clerk_sub = request.app.state.decode_token(request)
    collection = request.app.state.call_log_collection
    query = { "$match": {"clerk_sub": clerk_sub} }
    projection = { "$project": {
        "_id": 0, 
        "logs": {
            "$slice": [{ "$reverseArray": "$logs" },
            start, display_number]
            }
        }
    }
    res: list[dict] = await collection.aggregate([query, projection]).to_list(1)

    logs = res[0].get("logs", [])
    has_more = len(logs) == display_number
    print("has more logs", has_more)


    return {"CallLogList": logs, "hasMore": has_more}
