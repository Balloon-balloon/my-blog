FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate

# Push schema to database before starting
RUN npx prisma db push --skip-generate 2>/dev/null || true

EXPOSE 3000

CMD ["npm", "start"]
