FROM node:14
WORKDIR /usr/src/app

# why don't we copy everything? because docker will cache these package the next time it builds if package.json is not changed
COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .
RUN mv .env.production .env

RUN npm run build

ENV NODE_ENV=production

EXPOSE 8080
CMD [ "node", "dist/index.js" ]
USER node