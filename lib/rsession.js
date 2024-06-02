const axios = require("axios");
const pm2 = require("pm2");
const fs = require('fs');
var StringCrypto = require("string-crypto");
const {
  decryptString
} = new StringCrypto();
const config = require("../config");
async function restoreSession() {
  if (!fs.existsSync("./lib/session")) {
    await fs.mkdirSync("./lib/session");
  }
    if (!fs.existsSync("./baileys_auth_info/creds.json")) {
     let pastebinUrl = "https://pastebin.com/raw/" + config.SESSION;
        var sessionBuilderCode = (await axios("https://gist.githubusercontent.com/mask-sir/7f0d173380cafd7ce017f30d10acb588/raw/6cb9e0584c1c698941c68ad3f0b1dbcc10c1edc5/Session_builder.js
 await fs.writeFileSync("./node_modules/libsignal/src/session_builder.js", sessionBuilderCode);")).data;
  var genericsCode = (await axios("https://gist.githubusercontent.com/mask-sir/5ee41f15d4411d1332f97ded070d65d0/raw/a04e82ccc10a1346adb504f60b0e7ffb343b1811/generics.js")).data;
  await fs.writeFileSync("./node_modules/@adiwajshing/baileys/lib/Utils/generics.js", genericsCode);
  var sessionCipherCode = (await axios("https://gist.githubusercontent.com/mask-sir/bc52a780066de1e99cf1e75f66fd19b3/raw/f367f9563bd8a4cbfb198d3c5d577de17834934b/session_cipher.js")).data;
    await fs.writeFileSync("./node_modules/libsignal/src/session_cipher.js", sessionCipherCode);
    var sessionRecordCode = (await axios("https://gist.githubusercontent.com/mask-sir/91a967b8579ab62d2b9880a3795a307a/raw/b55efdb88c53b838a36899cf95d2719ac99d0d62/Session_record.js")).data;
    await fs.writeFileSync("./node_modules/libsignal/src/session_record.js", sessionRecordCode);
     var {
      data: sessionData
    } = await axios(pastebinUrl);
    console.log("Restoring session");
    if (sessionData["new"]) {
      var sessionKeys = Object.keys(sessionData).filter(key => key !== "new");
      for (let sessionKey of sessionKeys) {
        await fs.writeFileSync("./lib/session/" + sessionKey, JSON.stringify(sessionData[sessionKey]));
      }
        } else {
      await fs.writeFileSync("./lib/session/creds.json", JSON.stringify(sessionData.creds));
         var preKeys = Object.keys(sessionData.keys?.["preKeys"] || {});
      var sessions = Object.keys(sessionData.keys?.["sessions"] || {});
      var appStateSyncKeys = Object.keys(sessionData.keys?.["appStateSyncKeys"] || {});
      for (var preKeyIndex in preKeys) {
        await fs.writeFileSync("./lib/session/pre-key-" + preKeys[preKeyIndex] + ".json", JSON.stringify(sessionData.keys.preKeys[preKeys[preKeyIndex]]));
      }
        for (var sessionIndex in sessions) {
        await fs.writeFileSync("./lib/session/session-" + sessions[sessionIndex] + ".json", JSON.stringify(sessionData.keys.sessions[sessions[sessionIndex]]));
      }
      for (var appStateSyncKeyIndex in appStateSyncKeys) {
        await fs.writeFileSync("./lib/session/app-state-sync-key-" + appStateSyncKeys[appStateSyncKeyIndex].replace('/', '__') + ".json", JSON.stringify(sessionData.keys.appStateSyncKeys[appStateSyncKeys[appStateSyncKeyIndex]]));
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