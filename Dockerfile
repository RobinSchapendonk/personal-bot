FROM node:14

RUN mkdir -p /bot
WORKDIR /bot

COPY package.json /bot
RUN npm install

COPY . /bot

CMD node .