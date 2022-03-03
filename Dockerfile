FROM node

# Installation
WORKDIR /app

COPY package.json .

RUN npm i && \
    npm i ts-node

COPY . .

# Runtime
EXPOSE 7001
VOLUME [ "/data" ]

CMD ["npx", "ts-node", "src"]