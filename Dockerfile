FROM node:12-alpine
WORKDIR /app/
COPY package*.json ./
RUN npm install --production
COPY . ./
    ENV connstring=null
    ENV type=0
    CMD ["sh", "-c", "node app.js ${type} ${connstring}"]
