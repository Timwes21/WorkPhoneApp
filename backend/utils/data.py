import json
from fastapi import Request
from jwt import decode


async def get_data(request: Request) -> dict:
    data = await request.body()
    data = data.decode()
    data = json.loads(data)
    if "token" in request.headers:
        claims = decode(request.headers["token"], options={"verify_signature": False})
        data["clerk_sub"] = claims["sub"]
    return data
