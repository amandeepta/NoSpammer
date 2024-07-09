const { google } = require('googleapis');
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const executePython = async (script, input) => {
    const tempFilePath = path.join(__dirname, 'temp_emails.json');
    
    console.log("Writing email contents to temporary file...");
    fs.writeFileSync(tempFilePath, JSON.stringify(input)); // Serialize input as JSON string
    console.log("Temporary file written:", tempFilePath);

    return new Promise((resolve, reject) => {
        console.log("Spawning Python process...");
        const py = spawn("python", [script, tempFilePath]);

        let output = "";

        py.stdout.on('data', (data) => {
            output += data.toString(); // Accumulate output data
        });

        py.stderr.on("data", (data) => {
            console.error(`[python] Error occurred: ${data}`);
            reject(`Error occurred in ${script}`);
        });

        py.on("exit", (code) => {
            console.log("Python process exited with code:", code);
            try {
                // Assuming output is already a list of 1s and 0s
                const predictions = output.trim().split('\n').map(Number); // Convert to array of numbers
                console.log("Python script output:", predictions);
                resolve(predictions);
            } catch (e) {
                console.error("Failed to parse Python script output:", e);
                reject(`Failed to parse Python script output: ${output}`);
            } finally {
                console.log("Cleaning up temporary file...");
                try {
                    fs.unlinkSync(tempFilePath);
                    console.log("Temporary file deleted.");
                } catch (unlinkError) {
                    console.error("Error deleting temporary file:", unlinkError);
                }
            }
        });
    });
};

exports.email = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect('/auth/google');
        }

        if (!req.user) {
            throw new Error("req.user is not defined");
        }

        console.log("Fetching access token...");
        const accessToken = req.user.accessToken;

        let nextPageToken = null;
        let allMessages = [];
        let x = 1;
        do {
            console.log("Fetching messages from Gmail...");
            const response = await axios.get('https://www.googleapis.com/gmail/v1/users/me/messages', {
                params: {
                    pageToken: nextPageToken,
                    maxResults: 10, // Adjust batch size as needed
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.data || !response.data.messages) {
                console.error('No messages found');
                return res.status(404).json({ message: 'No messages found.' });
            }

            const messages = response.data.messages;
            console.log("Fetching full email content for each message...");
            // Use Promise.all to fetch content asynchronously
            await Promise.all(messages.map(async (message) => {
                const msgResponse = await axios.get(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    }
                });

                allMessages.push(msgResponse.data);
            }));

            nextPageToken = response.data.nextPageToken;
        } while (x--);

        console.log("Total email contents fetched:", allMessages.length);

        try {
            console.log("Executing Python script for spam prediction...");
            const predictions = await executePython('../model/predict.py', allMessages);
        
            console.log("Filtering messages based on predictions...");
            const filteredMessages = allMessages.filter((_, index) => {
                console.log(`Checking index ${index} of predictions:`, predictions[index]);
                return predictions[index] === 1;
            });
        
            console.log("Filtered messages:", filteredMessages.length);
            res.json(filteredMessages);
        } catch (pythonError) {
            console.error('Error executing Python script:', pythonError);
            res.status(500).json({ message: 'Error executing Python script.' });
        }
    } catch (error) {
        console.error('Error retrieving emails:', error);
        res.status(500).json({ message: 'Failed to retrieve emails.' });
    }
};
