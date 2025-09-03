FROM node:20-alpine

WORKDIR /app

RUN addgroup -S myGroup && adduser -S -G myGroup User

COPY  package*.json ./

RUN npm install

COPY . . 
 
RUN ls -R /app

RUN chown -R User:myGroup /app

USER User   

RUN npm run build

CMD ["npm","run","start"]

