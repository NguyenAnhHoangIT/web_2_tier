FROM node:20-alpine
WORKDIR /app

# Install production-only dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy source files
COPY . .

ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "server.js"]
