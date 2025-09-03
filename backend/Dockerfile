FROM node:20-alpine

WORKDIR /app

RUN addgroup myGroup && adduser --ingroup myGroup User

COPY  package*.json ./

RUN npm install

COPY . . 

RUN chown -R User:myGroup /app

USER User   

RUN npm run build

CMD ["npm","run","start"]

