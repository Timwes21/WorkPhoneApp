FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 1234
CMD ["node", "server.js"]
