FROM quay.io/mask_ser/mask-md:latest

RUN git clone https://github.com/shijil-tanur/wa-bot /root/bot
WORKDIR /root/bot/
RUN yarn install --network-concurrency 1
CMD ["node", "index.js"]