FROM node:20-slim
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter api-server build
WORKDIR /app/api-server
CMD ["node", "dist/index.mjs"]
