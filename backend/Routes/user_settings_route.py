from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from passlib.context import CryptContext
from utils.const import DefaultMessages
import secrets
from pydantic import BaseModel
from typing import TypedDict

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")





router = APIRouter()






# class UserSettings(TypedDict):






@router.get("/get-user-settings", response_class=JSONResponse)
async def user_settings(request: Request):
    clerk_sub = request.app.state.decode_token(request)
    collection = request.app.state.user_info_collection
    print("getting settings")
    result = await collection.find_one({'clerk_sub': clerk_sub}, {"_id":0, "clerk_sub": 0})
    # if result.get("")
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
                changed["ai_prompt"] = DefaultMessages.ai_prompt
            if "greeting_message" in changed.keys():
                changed["greeting_message"] = DefaultMessages.greeting_message(changed["name"])
            if "blocked_message" in changed.keys():
                changed["blocked_message"] = DefaultMessages.blocked_message

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

@router.get("/get-webhook-token", response_class=JSONResponse)
async def get_webhook_token(request: Request):
    clerk_sub = request.app.state.decode_token(request)

    user_info_collection = request.app.state.user_info_collection
    user = await user_info_collection.find_one({'clerk_sub': clerk_sub})
    if user.get("webhook_token", "") == "":
        webhook_token = secrets.token_urlsafe(32)

        user_info_collection.update_one({'clerk_sub': clerk_sub}, {"$set": {"webhook_token": webhook_token}})
        return webhook_token
    print("should precede webhook token")
    print(user["webhook_token"])
    return user["webhook_token"]

