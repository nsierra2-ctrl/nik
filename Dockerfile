FROM node:20-slim
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter api-server build
RUN pnpm --filter api-server deploy --prod --legacy /app/deploy
RUN cd /app/db && pnpm install --no-frozen-lockfile
CMD ["sh", "-c", "cd /app/db && npx drizzle-kit push && node --enable-source-maps /app/deploy/dist/index.mjs"]
