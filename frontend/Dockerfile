# Multi-stage Dockerfile for TaskFlow React Frontend
# Stage 1: Build static assets with Node.js
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./

# Build optimized production bundle
RUN npm run build

# Stage 2: Serve SPA with lightweight Nginx server
FROM nginx:alpine-slim AS runner

# Copy compiled distribution from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
