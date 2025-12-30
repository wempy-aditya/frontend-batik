### Multi-stage Dockerfile for Next.js (production)
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies (use package-lock if present for reproducible builds)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install

# Copy source and build
COPY . .
RUN npm run build

# Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy built files and public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Install only production deps
RUN npm ci --omit=dev || npm install --production

EXPOSE 3000

# Disable Next.js telemetry and start
ENV NEXT_TELEMETRY_DISABLED=1
CMD ["sh", "-c", "next start -p ${PORT}"]
