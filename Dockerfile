FROM node:20-slim
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter api-server build
RUN pnpm --filter api-server deploy --prod /app/deploy
CMD ["node", "/app/deploy/dist/index.mjs"]
