from contextlib import asynccontextmanager
from utils.db import get_mongo_collections
from utils.access_token import decode_access_token, create_access_token
from fastapi import FastAPI
from utils.data import get_data
from utils.redis import save_settings, get_setting, get_settings, remove_settings



@asynccontextmanager
async def lifespan(app: FastAPI):
    call_log_collection, docs_collection, user_info_collection, client = get_mongo_collections()
    app.state.call_log_collection = call_log_collection
    app.state.docs_collection = docs_collection
    app.state.user_info_collection = user_info_collection

    app.state.decode_token = decode_access_token
    app.state.create_token = create_access_token

    app.state.save_settings = save_settings
    app.state.get_setting = get_setting
    app.state.get_settings = get_settings
    app.state.remove_settings = remove_settings

    app.state.get_data = get_data

    




    yield
    client.close()
