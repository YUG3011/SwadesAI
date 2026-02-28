FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# Remove dev dependencies to keep production image small
RUN npm prune --production || true

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and production deps
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

EXPOSE 8080
ENV PORT=8080

CMD ["node", "dist/app.js"]
