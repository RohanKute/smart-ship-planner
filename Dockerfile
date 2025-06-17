FROM node:20-alpine

WORKDIR /usr/src/app


COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate


RUN npx tsc

EXPOSE 3000

CMD [ "node", "dist/app.js" ]