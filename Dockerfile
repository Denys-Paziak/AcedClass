# -------------------- STAGE 1: Build --------------------
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++ git

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --omit=dev

# -------------------- STAGE 2: Production --------------------
FROM node:20-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN addgroup -S app && adduser -S -G app app
USER app

EXPOSE 3000
CMD ["node", "dist/main"]
