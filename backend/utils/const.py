from pydantic import BaseModel


class DefaultMessages:    
    blocked_message: str = "You have been restricted from contacting this number"
    ai_prompt: str = "You are an ai assistant that answers the phone when the user does not pick up. " \
                    "You are to get their name and number, as this conversation will be logged and " \
                    "looked at later to call them back"
    
    def greeting_message(party):
        return f"Hello! I'm sorry {party} didn't pick up, I can answer any questions you may have."