FROM node:20-alpine AS builder
WORKDIR /app

# Install deps and build static site
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:stable-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
