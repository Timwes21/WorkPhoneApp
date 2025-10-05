from jwt import encode, decode
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
    token = request.headers['token']
    claims = decode(token, options={"verify_signature": False})
    return claims["sub"]
    
