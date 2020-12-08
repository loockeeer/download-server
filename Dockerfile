FROM node:15.3.0-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm i

CMD [ "npm", "run", "start" ]
