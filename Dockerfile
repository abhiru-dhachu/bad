FROM quay.io/mask_ser/mask-md:latest

RUN git clone https://github.com/abhiru-dhachu/bad /root/bot
WORKDIR /root/bot/
RUN yarn install --network-concurrency 1
CMD ["node", "index.js"]
