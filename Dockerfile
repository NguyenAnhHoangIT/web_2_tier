# Use lightweight Node Alpine for production
FROM node:20-alpine
WORKDIR /app

# Install production-only backend dependencies
COPY backend/package*.json ./backend/
RUN npm install --prefix backend --only=production

# Copy backend source files
COPY backend/ ./backend/

# Copy pre-compiled frontend assets from host (built via 'npm run build --prefix frontend')
COPY frontend/dist ./frontend/dist

# Expose port and run the server
ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "backend/server.js"]
