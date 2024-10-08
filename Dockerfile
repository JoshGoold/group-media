# Stage 1: Build node
FROM node:18.19.1 AS build-node

# Install dependencies for building
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copy static content 
COPY api /app/api
COPY front-end /app/front-end

# Install dependencies and run builds
RUN cd /app/front-end && npm install && npm run build \
    && cd /app/api && npm install --production

# Stage 2: Final Stage - production
FROM node:18.19.1-slim

# Install only production dependencies and supervisor
RUN apt-get update && apt-get install -y \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Copy build files from Stage 1 into Final Stage image
COPY --from=build-node /app /app

# Install nodemon globally
RUN npm install -g nodemon --production && \
    npm cache clean --force && \
    rm -rf /root/.npm /tmp/* /var/tmp/*

# Copy Supervisor configuration
COPY config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY config/supervisord.conf /etc/supervisor/supervisord.conf

# Finish | Set WORKDIR and expose dashboard port
WORKDIR /app/
EXPOSE 8080

# Start Supervisor to manage Node.js services
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]