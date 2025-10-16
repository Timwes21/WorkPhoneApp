from twilio.twiml.voice_response import VoiceResponse, Connect, Say, Stream
from fastapi.responses import HTMLResponse

def dial_person(webhook_token, user, callsid):
    real_number = f"+1{user["real_number"]}"
    response = VoiceResponse()
    dial = response.dial(number=real_number, action=f"/ai-assistant/get-call-status/{webhook_token}/{callsid}", timeout=15)
    response = VoiceResponse()
    response.append(dial)
    return HTMLResponse(content=str(response), media_type="application/xml")

def dial_agent(request, user, callsid):
    name = user["name"]
    response = VoiceResponse()
    response.say(f"You are being connected to {name}'s AI Assistant")
    host = request.url.hostname
    connect = Connect()
    url=f'wss://{host}/ai-assistant/media-stream/{user["webhook_token"]}/{callsid}'
    print(url)
    connect.stream(url=url)
    response.append(connect)
    print("int dial agent")
    return HTMLResponse(content=str(response), media_type="application/xml")

def blocked_number(user):
    blocked_message = user.get("blocked_message", "You have been restricted from contacting this number")
    response = VoiceResponse()
    response.say(blocked_message)
    return HTMLResponse(content=str(response), media_type="application/xml")

