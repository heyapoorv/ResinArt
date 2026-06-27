# Aura Resin – Server Dockerfile
# Multi-stage: build stage installs all deps, production stage only has prod deps

FROM node:20-alpine AS base
WORKDIR /app

# Install production dependencies only
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

# Final image – non-root user for security
FROM base AS runner
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodeapp -u 1001

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create logs directory with correct ownership
RUN mkdir -p logs && chown -R nodeapp:nodejs logs

USER nodeapp

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
