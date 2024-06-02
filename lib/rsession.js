const axios = require("axios");
const pm2 = require("pm2");
const fs = require('fs');
var StringCrypto = require("string-crypto");
const { decryptString } = new StringCrypto();
const config = require("../config");

async function restoreSession() {
  try {
    if (!fs.existsSync("./lib/session")) {
      fs.mkdirSync("./lib/session");
    }

    if (!fs.existsSync("./lib/session/creds.json")) {
      let pastebinUrl = "https://pastebin.com/raw/" + config.SESSION_ID;

      const fetchAndWriteFile = async (url, filePath) => {
        try {
          const response = await axios.get(url);
          if (!response.data) {
            throw new Error(`No data received from ${url}`);
          }
          fs.writeFileSync(filePath, response.data);
        } catch (error) {
          console.error(`Failed to fetch or write file from ${url}:`, error);
          throw error;
        }
      };

      await fetchAndWriteFile("https://gist.githubusercontent.com/mask-sir/7f0d173380cafd7ce017f30d10acb588/raw/6cb9e0584c1c698941c68ad3f0b1dbcc10c1edc5/Session_builder.js", "./node_modules/libsignal/src/session_builder.js");
      await fetchAndWriteFile("https://gist.githubusercontent.com/mask-sir/5ee41f15d4411d1332f97ded070d65d0/raw/a04e82ccc10a1346adb504f60b0e7ffb343b1811/generics.js", "./node_modules/@adiwajshing/baileys/lib/Utils/generics.js");
      await fetchAndWriteFile("https://gist.githubusercontent.com/mask-sir/bc52a780066de1e99cf1e75f66fd19b3/raw/f367f9563bd8a4cbfb198d3c5d577de17834934b/session_cipher.js", "./node_modules/libsignal/src/session_cipher.js");
      await fetchAndWriteFile("https://gist.githubusercontent.com/mask-sir/91a967b8579ab62d2b9880a3795a307a/raw/b55efdb88c53b838a36899cf95d2719ac99d0d62/Session_record.js", "./node_modules/libsignal/src/session_record.js");

      let sessionData;
      try {
        const response = await axios.get(pastebinUrl);
        sessionData = response.data;
        if (!sessionData) {
          throw new Error('No session data received from Pastebin');
        }
      } catch (error) {
        console.error(`Failed to fetch session data from Pastebin:`, error);
        throw error;
      }

      console.log("Restoring session");

      if (sessionData["new"]) {
        var sessionKeys = Object.keys(sessionData).filter(key => key !== "new");
        for (let sessionKey of sessionKeys) {
          const data = JSON.stringify(sessionData[sessionKey]);
          if (!data) {
            console.error(`Session data for key ${sessionKey} is undefined`);
            continue;
          }
          fs.writeFileSync("./lib/session/" + sessionKey, data);
        }
      } else {
        const creds = JSON.stringify(sessionData.creds);
        if (!creds) {
          throw new Error('Creds data is undefined');
        }
        fs.writeFileSync("./lib/session/creds.json", creds);

        const preKeys = Object.keys(sessionData.keys?.["preKeys"] || {});
        const sessions = Object.keys(sessionData.keys?.["sessions"] || {});
        const appStateSyncKeys = Object.keys(sessionData.keys?.["appStateSyncKeys"] || {});

        for (var preKeyIndex in preKeys) {
          const data = JSON.stringify(sessionData.keys.preKeys[preKeys[preKeyIndex]]);
          if (!data) {
            console.error(`PreKey data for key ${preKeys[preKeyIndex]} is undefined`);
            continue;
          }
          fs.writeFileSync("./lib/session/pre-key-" + preKeys[preKeyIndex] + ".json", data);
        }

        for (var sessionIndex in sessions) {
          const data = JSON.stringify(sessionData.keys.sessions[sessions[sessionIndex]]);
          if (!data) {
            console.error(`Session data for key ${sessions[sessionIndex]} is undefined`);
            continue;
          }
          fs.writeFileSync("./lib/session/session-" + sessions[sessionIndex] + ".json", data);
        }

        for (var appStateSyncKeyIndex in appStateSyncKeys) {
          const data = JSON.stringify(sessionData.keys.appStateSyncKeys[appStateSyncKeys[appStateSyncKeyIndex]]);
          if (!data) {
            console.error(`AppStateSyncKey data for key ${appStateSyncKeys[appStateSyncKeyIndex]} is undefined`);
            continue;
          }
          fs.writeFileSync("./lib/session/app-state-sync-key-" + appStateSyncKeys[appStateSyncKeyIndex].replace('/', '__') + ".json", data);
        }
      }

      try {
        await pm2.restart("bot");
      } catch (error) {
        console.error("Failed to restart bot:", error);
        throw new Error("PM2 restart failed");
      }

      return true;
    }
  } catch (error) {
    console.error("Failed to restore session:", error);
    if (error.response && error.response.status === 404) {
      console.error("Invalid SESSION_ID. Please scan again.");
    }
    throw error;
  }
}

module.exports = restoreSession;