FROM node:14-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN  apk add bind-tools && npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "run", "start" ]