FROM node:20-slim

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
COPY ./prisma ./prisma

RUN npm install
RUN apt-get update -y && apt-get install -y openssl
RUN npx prisma generate

COPY . .

EXPOSE 4000

CMD ["npm", "run", "start"]