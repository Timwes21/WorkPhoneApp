import redis.asyncio as redis
import os
from dotenv import load_dotenv
load_dotenv()

PORT = os.getenv("REDIS_PORT")
HOST = os.getenv("REDIS_HOST")
PASSWORD = os.getenv("REDIS_PASSWORD")


r = redis.Redis(host=HOST, port=PORT, password=PASSWORD, db=0, decode_responses=True)

async def save_settings(webhook_token: str, user_info: dict):
    await r.hset(webhook_token, mapping=user_info)


async def remove_settings(webhook_token):
    await r.hdel(webhook_token)

async def get_setting(webhook_token: str, setting_key: str)-> str:
    setting = await r.hget(webhook_token, setting_key)
    return setting

async def get_settings(webhook_token):
    a = await r.hgetall(webhook_token)
    return a

