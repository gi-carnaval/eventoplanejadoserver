FROM node:20-slim as BUILDER
LABEL maintainer="Giovani Carnaval"

WORKDIR /usr/src/app

#Install app dependencies
COPY package*.json ./
COPY tsconfig.json ./
COPY ./prisma ./prisma
COPY ./src ./src
RUN npm install
RUN npm install --save-dev @types/node

RUN npm run build

FROM node:20-alpine

ARG NODE_ENV

WORKDIR /usr/src/app

COPY --from=BUILDER /usr/src/app/ .

ENV POSTGRES_PRISMA_URL="postgres://avnadmin:AVNS_sNrH0bbgljevhJqmzoo@eventoplanejado-eventoplanejado.k.aivencloud.com:18625/defaultdb?sslmode=require&pgbouncer=true&connect_timeout=15"
ENV POSTGRES_URL_NON_POOLING="postgres://avnadmin:AVNS_sNrH0bbgljevhJqmzoo@eventoplanejado-eventoplanejado.k.aivencloud.com:18625/defaultdb?sslmode=require"

RUN npx prisma generate
RUN npx prisma migrate deploy

EXPOSE 3000

CMD ["npm", "run", "start"]