FROM node:15.3.0-alpine

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080
ENV HASH=md5

WORKDIR /usr/src/app

COPY . .

RUN npm i

CMD [ "npm", "run", "start" ]
