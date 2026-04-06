FROM node:18

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

EXPOSE 3001

CMD sh -c "npx prisma db push && node dist/src/main.js"