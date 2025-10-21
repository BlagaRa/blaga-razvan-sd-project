# --- Stage 1: build ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

RUN npx prisma generate --schema=apps/device-service/prisma/schema.prisma
RUN npx nest build device-service

# --- Stage 2: runtime ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist/apps/device-service ./dist/apps/device-service
COPY --from=builder /app/apps/device-service/prisma ./apps/device-service/prisma
COPY --from=builder /app/apps/device-service/generated ./apps/device-service/generated
COPY package*.json ./

RUN npm ci --omit=dev

CMD ["node", "dist/apps/device-service/main.js"]
