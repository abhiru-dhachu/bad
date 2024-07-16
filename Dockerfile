FROM quay.io/mask_ser/mask-md:latest

RUN git clone https://github.com/princerudh/rudhra-test /root/bot
WORKDIR /root/bot/
RUN yarn install --network-concurrency 1
CMD ["node", "index.js"]
