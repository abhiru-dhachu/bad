const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

async function saveJsonToFile(folder, session) {
	try {
		const fixFileName = (file) => file?.replace(/\//g, '__')?.replace(/:/g, '-');
		for (const objectName in session) {
			if (session.hasOwnProperty(objectName)) {
				const objectData = session[objectName];
				const fileName = `${fixFileName(objectName)}`;
				const serializedData = JSON.stringify(objectData);
				fs.writeFileSync(`${folder}/${fileName}`, serializedData);
			}
		}
	} catch (error) {}
}
async function MakeSession(sessionId, folderPath) {
    try {
        await fs.mkdir(folderPath, { recursive: true });
        const response = await axios.get(`https://pastebin.com/raw/${sessionId}`);
        await saveJsonToFile(folderPath, response.data)
        console.log("session loaded successfully");
    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}

module.exports = { MakeSession };