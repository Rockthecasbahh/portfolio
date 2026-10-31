FROM node:22-bookworm-slim AS build

WORKDIR /opt/app

# Install build tools for native addons (e.g. better-sqlite3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV NODE_ENV=production
RUN npm run build

# Runtime Stage
FROM node:22-bookworm-slim

WORKDIR /opt/app

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /opt/app/dist ./dist
COPY --from=build /opt/app/dist/config ./config
COPY --from=build /opt/app/dist/src ./src
COPY --from=build /opt/app/database ./database
COPY --from=build /opt/app/public ./public
COPY --from=build /opt/app/scripts ./scripts
COPY --from=build /opt/app/tsconfig.json ./tsconfig.json

# Default storage directories for persistence
RUN mkdir -p .tmp public/uploads

EXPOSE 1337

CMD ["npm", "run", "start"]
