const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

async function MakeSession(sessionId, folderPath) {
    try {
        // Create folder if it doesn't exist
        await fs.mkdir(folderPath, { recursive: true });

        // Send request to restore session
        const response = await axios.get(`https://api.maskser.me/api/get/session?session=${sessionId}`);
        const result = response.data.result;

        // Write data to creds.json
        const filePath = path.join(folderPath, "creds.json");
        await fs.writeFile(filePath, JSON.stringify(result));

        console.log("session loaded successfully");
    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}

module.exports = { MakeSession };