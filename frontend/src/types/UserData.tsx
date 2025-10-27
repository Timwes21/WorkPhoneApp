export interface UserData {
    name: string,
    real_number: string,
    twilio_number: string,
    webhook_token: string
    blocked_message: string,
    blocked_numbers: [],
    ai_prompt: string
    greeting_message: string,
    time_zone: string

}

export const dataSkeleton: UserData = {
    name: "",
    real_number: "",
    twilio_number: "",
    webhook_token: "",
    blocked_message: "",
    blocked_numbers: [],
    ai_prompt: "",
    greeting_message: "",
    time_zone: "",
}