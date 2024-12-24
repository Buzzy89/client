FROM --platform=linux/amd64 node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM --platform=linux/amd64 node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:8080/api/health || exit 1

EXPOSE 8080
CMD ["npm", "start"]