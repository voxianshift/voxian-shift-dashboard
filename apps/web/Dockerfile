# Build context: repo root
FROM node:24-slim AS build
WORKDIR /app
RUN npm install -g pnpm@12.11.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --filter @voxian/web...

COPY packages/shared packages/shared
COPY apps/web apps/web
# Web typechecking includes the canvas test's catalogue fixture.
COPY apps/api/data/navigator-pathways.json apps/api/data/navigator-pathways.json
# Next bakes /api/* rewrites into the build, so the API URL is a build arg, not a runtime env
ARG API_BASE_URL=https://voxian-api-184581024855.asia-southeast1.run.app
ENV API_BASE_URL=$API_BASE_URL
RUN pnpm --filter @voxian/web build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=8080
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
CMD ["node", "apps/web/server.js"]
