FROM node:20-slim

RUN rm -f /etc/localtime \
    && ln -sv /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        graphicsmagick \
        ghostscript \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . ./

ENV DATA_DIR=/app/data

WORKDIR /app/server

RUN npm install --force --registry=https://registry.npmmirror.com \
    && npm install @rollup/rollup-linux-x64-gnu --save-optional -f \
    && npm install --os=linux --cpu=x64 sharp

EXPOSE 3003

ENTRYPOINT ["npm", "run", "start"]

