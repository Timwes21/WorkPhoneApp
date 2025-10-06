import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from "dotenv";
dotenv.config();
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    allowedHosts: ["frontend-production-aa63.up.railway.app"],
  },
  server: {
    allowedHosts: ["frontend-production-aa63.up.railway.app"],
  }
})



