FROM node:16.19-alpine3.16

WORKDIR app/
COPY package.json .
RUN npm install
COPY ./src src/
CMD npm run dev