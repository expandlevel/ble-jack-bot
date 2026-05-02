FROM oven/bun:1 AS base

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

USER bun
EXPOSE 6700/tcp
ENTRYPOINT [ "bun", "run", "start:exter" ]
