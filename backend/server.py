import os
from utils.lifespan import lifespan
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from ngrok import connect
from Routes.AI_assistant_route import router as AI_assistant_route
from Routes.user_settings_route import router as auth_routes
from Routes.file_routes import router as file_routes
from Routes.portfolio_route import router as test_route


load_dotenv()


PORT = int(os.getenv('PORT', 5050))
print(PORT)
NGROK_TOKEN = os.getenv("NGROK_TOKEN")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://workphone.it.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(AI_assistant_route, prefix="/ai-assistant", tags=["AI Assistant"])
app.include_router(file_routes, prefix="/files", tags=["files"])
app.include_router(auth_routes, prefix="/auth", tags=["auth"])
app.include_router(test_route, prefix="/portfolio", tags=["test"])





    
if __name__ == "__main__":
    import uvicorn
    res = connect(addr=PORT, authtoken=NGROK_TOKEN); 
    print(f"Access at {res.url()}")
    uvicorn.run(
        app, 
        # host="0.0.0.0", 
        port=PORT
    )
