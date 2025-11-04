FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN apk add --no-cache git python3 make g++ || true
RUN npm install -g pnpm@8
RUN pnpm install --frozen-lockfile || pnpm install
COPY . .
RUN pnpm build --filter client
EXPOSE 3000
CMD ["node","server/index.js"]
