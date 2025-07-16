FROM node:24
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build || true
CMD ["npx", "ts-node", "src/index.ts"]
