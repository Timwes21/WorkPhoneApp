from jwt import encode, decode
from jwt.exceptions import DecodeError
from fastapi.exceptions import HTTPException
from fastapi import status
import os
import time
from dotenv import load_dotenv
load_dotenv()


SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = os.environ["ALGORITHM"]

def create_access_token() -> list:
    current = str(time.time())
    encoded_jwt = encode({"current": current}, SECRET_KEY, algorithm=ALGORITHM)
    return [encoded_jwt, current]

def decode_access_token(request) -> str:
    try:
        token = request.headers['token']
        claims = decode(token, options={"verify_signature": False})
        return claims["sub"]
    except DecodeError: 
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    
