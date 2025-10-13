export interface CallLog {
    callsid: string,
    date: {
        month: string,
        day: string,
        year: string,
        time: string
    },
    transcript: {
        role: string,
        text: string
    }[],
}
