FROM quay.io/prince_rudh/rudhra:latest

RUN git clone https://github.com/abhiru-dhachu/bad /root/bot
WORKDIR /root/bot/
RUN yarn install --network-concurrency 1
CMD ["node", "index.js"]
