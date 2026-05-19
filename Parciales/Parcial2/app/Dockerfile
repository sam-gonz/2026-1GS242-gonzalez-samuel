# --- Stage 1: build frontend ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: runtime with Bun ---
FROM oven/bun:1 AS runtime
WORKDIR /app
COPY package.json ./
RUN bun install --production
COPY --from=builder /app/dist/client ./dist/client
COPY src ./src
EXPOSE 3000
CMD ["bun", "run", "src/server/index.ts"]
