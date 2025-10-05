const production = "https://backend-production-8368.up.railway.app";
const local =  "http://127.0.0.1:5050";
const developing = true;
const base = developing? local : production;
export const authBase = base + "/auth";
export const fileBase = base + "/files";


