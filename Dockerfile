FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm@9 && pnpm install

COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--host"]
