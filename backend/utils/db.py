from pymongo import AsyncMongoClient
from motor.motor_asyncio import AsyncIOMotorClient
import pymongo
from dotenv import load_dotenv
import os
load_dotenv()


def get_mongo_collections():
    url = os.environ["MONGO_URL"]
    url = os.environ["MONGO_URL"]
    client = AsyncIOMotorClient(url)
    db = client["WorkPhone"]
    return db["call_logs"], db["docs"], db["user_info"], client



