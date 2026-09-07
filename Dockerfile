# syntax=docker/dockerfile:1

# Debian slim rather than alpine: bcrypt is a native module with no musl
# prebuild, so alpine would need python3/make/g++ in the builder.
FROM node:22-bookworm-slim AS base
ENV TZ=Asia/Kathmandu
# tzdata is not in debian-slim; without it TZ is silently ignored and the
# daily EMI cron fires at 05:45 NPT instead of midnight.
RUN apt-get update && apt-get install -y --no-install-recommends tzdata openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---- builder ----
FROM base AS builder

# prisma/ must land before `npm ci`: the postinstall hook runs
# `prisma generate`, which needs the schema already on disk.
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

COPY . .
RUN npm run build

# ---- runner ----
FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# `npm prune` rather than a fresh `npm ci --omit=dev`: prune drops devDeps
# without re-running install scripts, so bcrypt's compiled binding and the
# generated Prisma client both survive. A clean prod install would instead
# fail postinstall, since the prisma CLI is a devDependency.
RUN npm prune --omit=dev && npm cache clean --force

USER node
EXPOSE 3001

# Hits AppController's root route. Proves the process is serving; it does
# not touch the database — swap for /api/v1/health once that exists.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/api/v1').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]
