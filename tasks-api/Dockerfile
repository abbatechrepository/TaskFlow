FROM node:18

RUN apt-get update && apt-get install -y python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm install

EXPOSE 3001