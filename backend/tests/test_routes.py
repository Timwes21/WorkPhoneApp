import sys
from pathlib import Path

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))
from starlette.datastructures import Headers as Headers  # noqa: F401
from fastapi import FastAPI, UploadFile
from fastapi.testclient import TestClient
from backend.Routes.user_settings_route import router as auth
from Routes.file_routes import router as files
# from backend.Routes.portfolio_route import router as portfolio
from utils.lifespan import lifespan



app = FastAPI(lifespan=lifespan)
app.include_router(auth)
app.include_router(files)

token = {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXJyZW50IjoiMTc1MjEwNjA3OS45NDE2MzkifQ.bQAM2aGHP5vHcZmzVHYVAqMRxVs_5BLdWh1n2yVvJoU"}


def test_login():
    with TestClient(app) as client:
        response = client.post("/login", json={"username":"no", "password": "no"})
        assert response.status_code == 200
        response = response.json()
        assert response['logged_in'] == False



def test_logout():
    with TestClient(app) as client:
        response = client.post("/logout", json=token)
        assert response.status_code == 200
        response = response.json()
        assert response["message"] == "Logged Out"

def test_create_account():
    with TestClient(app) as client:
        response = client.post("/create-account", json={"username": "test", "password": "test", "name": "test", "twilio_number": "test", "real_number": "test"})
        assert response.status_code == 200
        response == response.json()
        assert response["message"] == "Username Already Exists"
        


def test_get_file():
    with TestClient(app) as client:
        response = client.post("/get-files", json={"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXJyZW50IjoiMTc1MTg3MDI3NS4yMTU2MTU3In0.EI48OSue4G0bAfIoftYDv4ptsy5BhUDPV6EneFOsAzM"})
        assert response.status_code == 200


# def test_save_file():
#     file = {
#         "file": ("example.txt", b"booger", "text/plain")
#     }
#     with TestClient(app) as client:
#         response = client.post("/save-files", data=token, files=file)
#         assert response.status_code == 200

def test_delete_file():
    with TestClient(app) as client:
        response = client.post("/delete-file", json={"filename": "test", **token})
        assert response.status_code == 200


