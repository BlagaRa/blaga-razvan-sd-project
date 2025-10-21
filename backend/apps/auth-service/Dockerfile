# --- Stage 1: build ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

# Prisma generate în container (engine linux-musl) + copiem prisma/generated
RUN npx prisma generate --schema=apps/auth-service/prisma/schema.prisma

# Build proiectul Nest pe numele proiectului din nest-cli.json
RUN npx nest build auth-service

# --- Stage 2: runtime ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copiem doar ce trebuie în runtime
COPY --from=builder /app/dist/apps/auth-service ./dist/apps/auth-service
COPY --from=builder /app/apps/auth-service/prisma ./apps/auth-service/prisma
COPY --from=builder /app/apps/auth-service/generated ./apps/auth-service/generated
COPY package*.json ./

RUN npm ci --omit=dev

CMD ["node", "dist/apps/auth-service/main.js"]
