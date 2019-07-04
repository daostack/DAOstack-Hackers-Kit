FROM node:10-alpine
WORKDIR /app
ENV HOME /app

RUN apk add --update --no-cache bash curl g++ gcc git jq make python
RUN npm config set unsafe-perm true
RUN npm install -g nodemon

COPY package.json /app/package.json
RUN npm install

COPY public /app/public
COPY src /app/src

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start"]
