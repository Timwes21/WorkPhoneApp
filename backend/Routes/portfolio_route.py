from fastapi import APIRouter, Form, UploadFile, Request, WebSocket, WebSocketDisconnect
from utils.file_parse import get_doc_contents
from utils.query import save_docs_with_faiss
from utils.call_choice import dial_agent
from utils.deepgram_ws import DGWS
import json
import asyncio
import os

OPENAI_API_KEY = os.getenv('OPENAI_KEY')


router = APIRouter()

@router.post("/test")
async def test(request: Request, name: str = Form(...), file: UploadFile = Form(...)):
    contents_of_file: dict = await get_doc_contents(file)
    await save_docs_with_faiss(contents_of_file, "7726771701", portfolio=True)
    collection = request.app.state.user_info_collection
    await collection.update_one({"twilio_number": "7726771701"}, {"$set": {"files": contents_of_file, "name": name}})
    return "Updated!"

@router.api_route("/incoming-call/{business_number}", methods=["GET", "POST"])
async def handle_incoming_call(request: Request, business_number: str):
    print("***in incoming-call route***")
    return await dial_agent(request, business_number, "portfolio")

@router.websocket("/media-stream/{business_number}")
async def handle_media_stream(websocket: WebSocket, business_number: str):
    """Handle WebSocket connections between Twilio and OpenAI."""
    await websocket.accept()
    try:
        user_info_collection = websocket.app.state.user_info_collection
        call_log_collection = websocket.app.state.call_log_collection

        deepgram = DGWS(user_info_collection, call_log_collection)
        await deepgram.start(websocket, business_number)
    
        print("waited for everything")
    except WebSocketDisconnect as e:
        print("ws is closed: ")
        print(e)

    