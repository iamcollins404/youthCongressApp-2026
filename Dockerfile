FROM node:20-alpine

WORKDIR /app

# Copy API package files and install deps
COPY api/package*.json ./
RUN npm install --omit=dev

# Copy API source
COPY api/ ./

EXPOSE 5000

CMD ["node", "server.js"]
