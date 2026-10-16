# Build context: repo root
FROM node:24-slim
WORKDIR /app
RUN npm install -g pnpm@12.11.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --prod --filter @voxian/api...

COPY packages/shared/src packages/shared/src
COPY apps/api/src apps/api/src
COPY apps/api/scripts apps/api/scripts
COPY apps/api/migrations apps/api/migrations

ENV NODE_ENV=production
# Node runs the TypeScript directly (type stripping); Cloud Run sets PORT
CMD ["node", "apps/api/src/server.ts"]
