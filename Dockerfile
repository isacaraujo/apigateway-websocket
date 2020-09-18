FROM node:14.11.0-alpine3.12

RUN mkdir /app
WORKDIR /app

COPY package* /app/

RUN npm ci --only=prod

COPY . /app

CMD ["node", "src/index.js"]