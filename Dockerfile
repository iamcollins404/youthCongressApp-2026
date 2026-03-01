FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install all workspace dependencies
RUN npm ci

# Copy workspace packages
COPY api ./api
COPY client ./client

# Build client
RUN npm run build

# Expose port
ENV PORT=5000
EXPOSE 5000

# Start API
CMD ["npm", "run", "start"]
