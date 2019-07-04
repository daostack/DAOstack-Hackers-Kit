FROM node:10-alpine
WORKDIR /app

RUN apk update \
    && apk upgrade \
    && apk add --no-cache bash git openssh python make g++

COPY package.json package.json
RUN npm i

COPY contracts contracts
COPY data data
COPY migrations migrations
COPY ops ops
COPY truffle.js truffle.js
COPY .env .env
COPY scripts/wait-for-it.sh wait-for-it.sh
RUN chmod +x wait-for-it.sh

EXPOSE 8545

ENTRYPOINT ["bash", "ops/entry.sh"]
