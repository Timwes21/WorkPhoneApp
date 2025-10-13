from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from passlib.context import CryptContext
from jwt import encode, decode
import secrets
from pydantic import BaseModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")





router = APIRouter()




class Updated(BaseModel):
    updated: str



@router.get("/user-settings", response_class=JSONResponse)
async def user_settings(request: Request):
    clerk_sub = request.app.state.decode_token(request)
    collection = request.app.state.user_info_collection
    print("getting settings")
    result = await collection.find_one({'clerk_sub': clerk_sub}, {"name":1, "real_number": 1, "twilio_number":1, "_id":0})
    print("got settings")
    return result

@router.post("/change-user-settings", response_class=JSONResponse)
async def change_user_settings(request: Request):
    try:
        data: dict = await request.app.state.get_data(request)
        changed = data["changed"]
        collection = request.app.state.user_info_collection
        await collection.update_one({"clerk_sub": data['clerk_sub']}, {"$set": changed})
        return {"Changed": "Success"}
    except Exception as e:
        print(e)
        return {"Changed": "Failure"}

@router.get("/blocked-numbers", response_class=JSONResponse)
async def blocked_numbers(request: Request):
    clerk_sub = request.app.state.decode_token(request)
    collection = request.app.state.user_info_collection
    result = await collection.find_one({'clerk_sub': clerk_sub}, {"_id":0, "blocked_numbers": 1})
    return {"numbers": result.get("blocked_numbers", [])}


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
    try:
        clerk_sub = request.app.state.decode_token(request)
    except: 
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    user_info_collection = request.app.state.user_info_collection
    user = await user_info_collection.find_one({'clerk_sub': clerk_sub})
    if user.get("webhook_token", "") == "":
        webhook_token = secrets.token_urlsafe(32)

        user_info_collection.update_one({'clerk_sub': clerk_sub}, {"$set": {"webhook_token": webhook_token}})
        return webhook_token
    print("should precede webhook token")
    print(user["webhook_token"])
    return user["webhook_token"]

@router.get("/get-blocked-message")
async def get_blocked_message(request: Request):
    clerk_sub = request.app.state.decode_token(request)

    user_info_collection = request.app.state.user_info_collection
    user = await user_info_collection.find_one({'clerk_sub': clerk_sub})
    if user.get("blocked_message", "") == "":
        message = "You have been restricted from contacting this number"
        user_info_collection.update_one({'clerk_sub': clerk_sub}, {"$set": {"blocked_message": message}})
        return message
    return user["blocked_message"]

@router.get("/get-greeting")
async def get_blocked_message(request: Request):
    clerk_sub = request.app.state.decode_token(request)

    user_info_collection = request.app.state.user_info_collection
    user = await user_info_collection.find_one({'clerk_sub': clerk_sub})
    party = "your party" if user["name"] == "" else user["name"]
    if user.get("greeting_message", "") == "":
        message = f"Hello! I'm sorry {party} didn't pick up, I can answer any questions you may have."
        user_info_collection.update_one({'clerk_sub': clerk_sub}, {"$set": {"greeting_message": message}})
        return message
    return user["greeting_message"]

@router.get("/get-prompt")
async def get_blocked_message(request: Request):
    clerk_sub = request.app.state.decode_token(request)

    user_info_collection = request.app.state.user_info_collection
    user = await user_info_collection.find_one({'clerk_sub': clerk_sub})
    if user.get("ai_prompt", "") == "":
        message = "You are an ai assistant that answers the phone when the user does not pick up. You are to get their name and number, as this conversation will be logged and looked at later to call them back"
        user_info_collection.update_one({'clerk_sub': clerk_sub}, {"$set": {"ai_prompt": message}})
        return message
    return user["ai_prompt"]


