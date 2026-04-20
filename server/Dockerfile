# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy server code
COPY server.js .

# Expose the backend port
EXPOSE 3001

# Run the server
CMD ["npm", "start"]
