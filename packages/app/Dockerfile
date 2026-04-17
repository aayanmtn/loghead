# ---------- BASE ----------
FROM node:20-alpine@sha256:09e2b3d9726018aecf269bd35325f46bf75046a643a66d28360ec71132750ec8 AS base

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl ca-certificates && \
    corepack enable && \
    rm -rf /var/cache/apk/* /tmp/*

# ---------- DEPENDENCIES ----------
FROM base AS deps

COPY package.json ./
RUN corepack prepare --activate

COPY .yarnrc.yml ./
COPY yarn.lock ./

RUN yarn install && \
    yarn cache clean

# ---------- BUILD ----------
FROM base AS builder

ARG NEXT_PUBLIC_BETTER_AUTH_BASE_URL
ARG BETTER_AUTH_BASE_URL
ARG NEXT_PUBLIC_GTM_ID
# Stripe key needed at build time so the SDK doesn't throw during page data collection
ARG STRIPE_SECRET_KEY=sk_test_placeholder

ENV NEXT_PUBLIC_BETTER_AUTH_BASE_URL=$NEXT_PUBLIC_BETTER_AUTH_BASE_URL \
    BETTER_AUTH_BASE_URL=$BETTER_AUTH_BASE_URL \
    NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID \
    STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/package.json ./
RUN corepack prepare --activate

COPY --from=deps /app/.yarnrc.yml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/yarn.lock ./

COPY . .

RUN yarn install && yarn build && \
    rm -rf .git .gitignore .env* *.md docs/

# ---------- RUNNER ----------
FROM node:20-alpine@sha256:09e2b3d9726018aecf269bd35325f46bf75046a643a66d28360ec71132750ec8 AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NODE_OPTIONS="--dns-result-order=ipv4first" \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs && \
    apk add --no-cache netcat-openbsd && \
    mkdir -p /app/.next/cache /app/public/avatars && \
    chown -R nextjs:nodejs /app && \
    rm -rf /var/cache/apk/* /tmp/*

# Standalone output already bundles its own node_modules — no need to copy full node_modules
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/start.sh ./
# Copy better-auth CLI so migrations can run at container startup
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@better-auth ./node_modules/@better-auth

RUN chmod +x start.sh && \
    chmod -R 550 /app && \
    chmod -R 770 /app/.next/cache && \
    chmod -R 770 /app/public/avatars && \
    chown -R nextjs:nodejs /app/.next/cache /app/public/avatars

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))" || exit 1

CMD ["./start.sh"]
