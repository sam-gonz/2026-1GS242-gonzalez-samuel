FROM oven/bun:1

# Install Node.js for Vite build
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./

# Install all deps with npm (needed for Vite)
RUN npm install

COPY . .

# Build frontend
RUN npm run build

RUN ls -la /app/dist/client

# Install only production deps with Bun for runtime
RUN bun install --production

EXPOSE 3000
CMD ["bun", "run", "src/server/index.ts"]
