FROM node:8.10-alpine

WORKDIR /app

COPY ./package.json ./config.js ./yarn.lock ./
RUN npm install yarn -g
RUN yarn install

COPY ./src ./src

CMD ["npm", "start"]
