from twilio.rest import Client




twilio_number = "+17722476154"

client = Client(account_sid, auth_token)
def send_message():
    message = client.messages.create(
        body="Hello world!",
        from_=twilio_number,   # your Twilio number
        to="+17726210972"       # recipient
    )
    print(message.sid)
    print(message.status)


def check_message():
    msg = client.messages("SMbae53e27d59860c67ce002174bf927f3").fetch()
    print(msg.status, msg.error_code, msg.error_message)

check_message()