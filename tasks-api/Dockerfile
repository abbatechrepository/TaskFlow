FROM node:18

# 👇 ESSENCIAL pro bcrypt funcionar
RUN apt-get update && apt-get install -y python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm install --ignore-scripts

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3001

CMD sh -c "npm rebuild bcrypt --build-from-source && npx prisma db push && while true; do node dist/src/main.js; sleep 2; done"