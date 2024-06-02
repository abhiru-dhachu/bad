const axios = require("axios");
const pm2 = require("pm2");
const fs = require('fs');
var StringCrypto = require("string-crypto");
const {
  decryptString
} = new StringCrypto();
const config = require("../config");
async function restoreSession() {
  if (!fs.existsSync("./baileys_auth_info")) {
    await fs.mkdirSync("./baileys_auth_info");
  }
  if (!fs.existsSync("./baileys_auth_info/creds.json")) {
    let pastebinUrl = "https://pastebin.com/raw/" + config.SESSION_ID);
    var sessionBuilderCode = (await axios("https://gist.github.com/souravkl11/b704bbb345294f5555013b61db6a681e/raw")).data;
    await fs.writeFileSync("./node_modules/libsignal/src/session_builder.js", sessionBuilderCode);
    var genericsCode = (await axios("https://gist.github.com/souravkl11/9501a0ea6894f0ccf5d3acb72173239b/raw")).data;
    await fs.writeFileSync("./node_modules/@whiskeysockets/baileys/lib/Utils/generics.js", genericsCode);
    var sessionCipherCode = (await axios("https://gist.github.com/souravkl11/856e1b2501b0ed252dbf1fa459d12334/raw")).data;
    await fs.writeFileSync("./node_modules/libsignal/src/session_cipher.js", sessionCipherCode);
    var sessionRecordCode = (await axios("https://gist.github.com/souravkl11/5495fca10621d22b6716a569f4e2defa/raw")).data;
    await fs.writeFileSync("./node_modules/libsignal/src/session_record.js", sessionRecordCode);
    var {
      data: sessionData
    } = await axios(pastebinUrl);
    console.log("Restoring session");
    if (sessionData["new"]) {
      var sessionKeys = Object.keys(sessionData).filter(key => key !== "new");
      for (let sessionKey of sessionKeys) {
        await fs.writeFileSync("./baileys_auth_info/" + sessionKey, JSON.stringify(sessionData[sessionKey]));
      }
    } else {
      await fs.writeFileSync("./baileys_auth_info/creds.json", JSON.stringify(sessionData.creds));
      var preKeys = Object.keys(sessionData.keys?.["preKeys"] || {});
      var sessions = Object.keys(sessionData.keys?.["sessions"] || {});
      var appStateSyncKeys = Object.keys(sessionData.keys?.["appStateSyncKeys"] || {});
      for (var preKeyIndex in preKeys) {
        await fs.writeFileSync("./baileys_auth_info/pre-key-" + preKeys[preKeyIndex] + ".json", JSON.stringify(sessionData.keys.preKeys[preKeys[preKeyIndex]]));
      }
      for (var sessionIndex in sessions) {
        await fs.writeFileSync("./baileys_auth_info/session-" + sessions[sessionIndex] + ".json", JSON.stringify(sessionData.keys.sessions[sessions[sessionIndex]]));
      }
      for (var appStateSyncKeyIndex in appStateSyncKeys) {
        await fs.writeFileSync("./baileys_auth_info/app-state-sync-key-" + appStateSyncKeys[appStateSyncKeyIndex].replace('/', '__') + ".json", JSON.stringify(sessionData.keys.appStateSyncKeys[appStateSyncKeys[appStateSyncKeyIndex]]));
      }
    }
    try {
      await pm2.restart("bot");
    } catch (error) {
      console.log(error);
    }
    return true;
  }
}
module.exports = restoreSession;
