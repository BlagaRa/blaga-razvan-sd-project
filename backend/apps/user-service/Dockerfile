# --- Stage 1: build ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

RUN npx prisma generate --schema=apps/user-service/prisma/schema.prisma
RUN npx nest build user-service

# --- Stage 2: runtime ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist/apps/user-service ./dist/apps/user-service
COPY --from=builder /app/apps/user-service/prisma ./apps/user-service/prisma
COPY --from=builder /app/apps/user-service/generated ./apps/user-service/generated
COPY package*.json ./

RUN npm ci --omit=dev

CMD ["node", "dist/apps/user-service/main.js"]
