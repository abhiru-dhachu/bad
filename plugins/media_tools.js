const config = require("../config");
const { Rudhra, mode, toAudio } = require("../lib/");

Rudhra(
  {
    pattern: "photo",
    fromMe: mode,
    desc: "Converts sticker to photo",
    type: "converter",
  },
  async (message, match, client) => {
    if (!message.reply_message || !message.reply_message.sticker) {
      return await message.reply("Reply to a sticker");
    }
    const buff = await message.quoted.download("buffer");
    return await message.sendMessage(message.jid, buff, {}, "image");
  }
);
 Rudhra({
  pattern: "mp3",
  fromMe: mode,
  desc: "converts video/voice to mp3",
  type: "downloader",
}, async (message, match) => {
  try {
    let buff = await message.quoted.download("buffer");
    console.log(typeof buff);
    buff = await toAudio(buff, "mp3");
    console.log(typeof buff);
    return await message.sendMessage(
      message.jid,
      buff,
      { mimetype: "audio/mpeg" },
      "audio"
    );
  } catch (error) {
    console.error("Error:", error);
    return await message.sendMessage("An error occurred while processing your request.");
  }
});