from fastapi import APIRouter, Request, Form, UploadFile
from fastapi.responses import JSONResponse
from utils.query import save_docs_with_faiss
from utils.file_parse import get_doc_contents
from jwt.exceptions import DecodeError




router = APIRouter()

async def get_list(items: list):
    for index, value in enumerate(items):
        yield index, value

async def get_dict(items: dict):
    for key, value in items.items():
        yield key, value

@router.post("/save-files", response_class=JSONResponse)
async def save_files(request: Request, file: UploadFile = Form(...)):
    docs_collection = request.app.state.docs_collection
    file_name = file.filename
    clerk_sub = request.app.state.decode_token(request)
    
    res_docs = await docs_collection.find_one({"clerk_sub": clerk_sub})
    files = res_docs.get('files', [])
    file_names = [file_name async for _,file in get_list(files) async for file_name,_ in get_dict(file)]
    if file_name in file_names:
        return {"file_exists": True}
    
    
    
    contents = await get_doc_contents(file)
    user_info_collection = request.app.state.user_info_collection
    res_info = await user_info_collection.find_one({"clerk_sub": clerk_sub}, {"_id": 0, "twilio_number": 1})

    await save_docs_with_faiss([contents], res_info['twilio_number'])
    await docs_collection.update_one({"clerk_sub": clerk_sub},{"$push": {"files": {file_name: contents}}})
    return {"file_exists": False}
    
    
    
    

    
@router.get("/get-files", response_class=JSONResponse)
async def get_files(request: Request):
    clerk_sub = request.app.state.decode_token(request)
    collection = request.app.state.docs_collection
    user = await collection.find_one({"clerk_sub": clerk_sub})
    files = user.get('files', [])
    file_names = [file_name async for _,file in get_list(files) async for file_name,_ in get_dict(file)]
    print(file_names)
    return {"files": file_names}

@router.post("/delete-file")
async def delete_file(request: Request):
    data = await request.app.state.get_data(request)
    collection = request.app.state.docs_collection
    file_name = data["filename"]
    user_account = await collection.find_one({"clerk_sub": data["clerk_sub"]}) or {}
    files: list[dict] = user_account.get("files", [])
    
    async for index, value in get_list(files):
        if file_name in value.keys():
            files.pop(index)    
            break


    all_files_contents = [k async for _, i in get_list(files) async for _, k in get_dict(i)]
    await save_docs_with_faiss(all_files_contents, user_account.get('clerk_sub', ""))
    await collection.update_one({"clerk_sub": data['clerk_sub']},{"$set": {"files": files}})
    return "Success"
