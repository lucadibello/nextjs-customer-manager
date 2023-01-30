FROM node:18 AS dependencies
ENV NODE_ENV=production
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:18 AS builder
ENV NODE_ENV=development
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN yarn prisma generate && yarn build
# Deploy Prisma Migrations to Production db

FROM node:18 AS production
WORKDIR /app
ENV HOST=0.0.0.0
ENV PORT=3000
COPY --chown=node --from=builder /app/next.config.js ./
COPY --chown=node --from=builder /app/public ./public
COPY --chown=node --from=builder /app/.next ./.next
COPY --chown=node --from=builder /app/yarn.lock /app/package.json ./
COPY --chown=node --from=builder /app/node_modules ./node_modules
ENV DATABASE_URL=postgresql://postgres:postgres@postgres:5432/postgres
COPY --chown=node --from=builder /app/prisma ./prisma
COPY --chown=node --from=builder /app/.env ./
COPY --chown=node --from=builder /app/.env.local ./
USER node
EXPOSE 3000
CMD [ "yarn", "start" ]