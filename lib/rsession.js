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
      console.log("Session data received from Pastebin:", sessionData);
    } catch (error) {
      console.error(`Failed to fetch session data from Pastebin:`, error);
      throw error;
    }

    console.log("Restoring session");

    const writeSessionFile = (fileName, data) => {
      const jsonData = JSON.stringify(data);
      if (!jsonData) {
        console.error(`Data for ${fileName} is undefined or empty`);
        return;
      }
      fs.writeFileSync(`./lib/session/${fileName}.json`, jsonData);
    };

    // Write session data
    if (sessionData.noiseKey) writeSessionFile("noiseKey", sessionData.noiseKey);
    if (sessionData.pairingEphemeralKeyPair) writeSessionFile("pairingEphemeralKeyPair", sessionData.pairingEphemeralKeyPair);
    if (sessionData.signedIdentityKey) writeSessionFile("signedIdentityKey", sessionData.signedIdentityKey);
    if (sessionData.signedPreKey) writeSessionFile("signedPreKey", sessionData.signedPreKey);
    if (sessionData.registrationId) writeSessionFile("registrationId", sessionData.registrationId);
    if (sessionData.advSecretKey) writeSessionFile("advSecretKey", sessionData.advSecretKey);
    if (sessionData.processedHistoryMessages) writeSessionFile("processedHistoryMessages", sessionData.processedHistoryMessages);
    if (sessionData.nextPreKeyId) writeSessionFile("nextPreKeyId", sessionData.nextPreKeyId);
    if (sessionData.firstUnuploadedPreKeyId) writeSessionFile("firstUnuploadedPreKeyId", sessionData.firstUnuploadedPreKeyId);
    if (sessionData.accountSyncCounter) writeSessionFile("accountSyncCounter", sessionData.accountSyncCounter);
    if (sessionData.accountSettings) writeSessionFile("accountSettings", sessionData.accountSettings);
    if (sessionData.deviceId) writeSessionFile("deviceId", sessionData.deviceId);
    if (sessionData.phoneId) writeSessionFile("phoneId", sessionData.phoneId);
    if (sessionData.identityId) writeSessionFile("identityId", sessionData.identityId);
    if (sessionData.registered) writeSessionFile("registered", sessionData.registered);
    if (sessionData.backupToken) writeSessionFile("backupToken", sessionData.backupToken);
    if (sessionData.registration) writeSessionFile("registration", sessionData.registration);
    if (sessionData.account) writeSessionFile("account", sessionData.account);
    if (sessionData.me) writeSessionFile("me", sessionData.me);
    if (sessionData.signalIdentities) writeSessionFile("signalIdentities", sessionData.signalIdentities);
    if (sessionData.platform) writeSessionFile("platform", sessionData.platform);
    if (sessionData.lastAccountSyncTimestamp) writeSessionFile("lastAccountSyncTimestamp", sessionData.lastAccountSyncTimestamp);
    if (sessionData.myAppStateKeyId) writeSessionFile("myAppStateKeyId", sessionData.myAppStateKeyId);

    try {
      await pm2.restart("bot");
    } catch (error) {
      console.error("Failed to restart bot:", error);
      throw new Error("PM2 restart failed");
    }

    return true;
  } catch (error) {
    console.error("Failed to restore session:", error);
    if (error.response && error.response.status === 404) {
      console.error("Invalid SESSION_ID. Please scan again.");
    }
    throw error;
  }
}

module.exports = restoreSession;