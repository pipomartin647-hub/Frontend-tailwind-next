# ─────────────────────────────────────────────────────────────────────────────
#  STAGE 1 — Instalar dependencias
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS deps
RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ─────────────────────────────────────────────────────────────────────────────
#  STAGE 2 — Build
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
RUN corepack enable pnpm

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_API_URL se bake en el bundle en tiempo de build.
# En Docker, el browser del usuario accede al backend en localhost:3001.
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm build

# ─────────────────────────────────────────────────────────────────────────────
#  STAGE 3 — Producción (imagen mínima Next.js standalone)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Next.js standalone output incluye todo lo necesario
COPY --from=builder /app/public          ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static    ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
