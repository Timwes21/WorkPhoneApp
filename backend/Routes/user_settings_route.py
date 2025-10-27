from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from passlib.context import CryptContext
from utils.const import DefaultSettings
import secrets
# from pydantic import BaseModel
from typing import TypedDict

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")





router = APIRouter()






class UserSettings(TypedDict):
    name: str
    real_number: str
    twilio_number: str
    webhook_token: str
    blocked_message: str
    blocked_numbers: list
    ai_prompt: str
    greeting_message: str






@router.get("/get-user-settings", response_class=JSONResponse)
async def user_settings(request: Request):
    clerk_sub = request.app.state.decode_token(request)
    collection = request.app.state.user_info_collection
    print("getting settings")
    result: UserSettings = await collection.find_one({'clerk_sub': clerk_sub}, {"_id":0, "clerk_sub": 0})
    print("got settings")
    return {"results": result}


@router.post("/change-user-settings", response_class=JSONResponse)
async def change_user_settings(request: Request):
    try:
        data: dict = await request.app.state.get_data(request)
        changed: dict = data["changed"]
        collection = request.app.state.user_info_collection
        if "" in changed.values():
            if "ai_prompt" in changed.keys():
                changed["ai_prompt"] = DefaultSettings.ai_prompt
            if "greeting_message" in changed.keys():
                changed["greeting_message"] = DefaultSettings.greeting_message(changed["name"])
            if "blocked_message" in changed.keys():
                changed["blocked_message"] = DefaultSettings.blocked_message

        await collection.update_one({"clerk_sub": data['clerk_sub']}, {"$set": changed})
        return {"Changed": "Success"}
    except Exception as e:
        print(e)
        return {"Changed": "Failure"}
    


@router.post("/add-blocked-number", response_class=JSONResponse)
async def add_blocked_number(request: Request):
    data: dict = await request.app.state.get_data(request)
    number = data["number"]
    collection = request.app.state.user_info_collection
    await collection.update_one({"clerk_sub": data['clerk_sub']}, {"$push": {"blocked_numbers": number}})
    return {"Changed": "Success"}

@router.post("/remove-blocked-number")
async def remove_blocked_number(request: Request):
    data: dict = await request.app.state.get_data(request)
    number = data["number"]
    collection = request.app.state.user_info_collection
    await collection.update_one({"clerk_sub": data['clerk_sub']}, {"$pull": {"blocked_numbers": number}})
    return {"Changed": "Success"}


@router.get("/generate-new-webhook-token")
async def get_webhook_token(request: Request):
    clerk_sub = request.app.state.decode_token(request)
    webhook_token = secrets.token_urlsafe(32)
    user_info_collection = request.app.state.user_info_collection
    user_info_collection.update_one({'clerk_sub': clerk_sub}, {"$set": {"webhook_token": webhook_token}})
    return webhook_token