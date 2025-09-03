FROM node:20-alpine

WORKDIR /app

RUN addgroup -S myGroup && adduser -S -G myGroup User

COPY  package*.json ./

RUN npm install

COPY . . 
 
RUN ls -la routes/
RUN cat routes/measurementsRoutes.ts || echo "File not found"

RUN chown -R User:myGroup /app

USER User   

RUN npm run build

EXPOSE 3000

CMD ["npm","run","start"]

