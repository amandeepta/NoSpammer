const { google } = require('googleapis');
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const executePython = async (script, input) => {
    const tempFilePath = path.join(__dirname, 'temp_emails.json');
    fs.writeFileSync(tempFilePath, JSON.stringify(input));

    return new Promise((resolve, reject) => {
        const py = spawn("python", [script, tempFilePath]);

        let output = "";
        py.stdout.on('data', (data) => {
            output += data.toString();
        });

        py.stderr.on("data", (data) => {
            console.error(`[python] ${data}`);
        });

        py.on("exit", (code) => {
            try {
                if (code === 0) {
                    const predictions = output.trim().split('\n').map(Number);
                    resolve(predictions);
                } else {
                    reject(`Python script exited with code ${code}`);
                }
            } catch (e) {
                reject(`Failed to parse Python script output: ${output}`);
            } finally {
                try {
                    fs.unlinkSync(tempFilePath);
                } catch (unlinkError) {
                    console.error("Error deleting temporary file:", unlinkError);
                }
            }
        });
    });
};

exports.email = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/google');
    }

    if (!req.user) {
        return res.status(500).json({ message: "User not authenticated" });
    }

    const accessToken = req.user.accessToken;
    let allMessages = [];
    let nextPageToken = null;

    try {
        let x = 1;
        do {
            const response = await axios.get('https://www.googleapis.com/gmail/v1/users/me/messages', {
                params: {
                    pageToken: nextPageToken,
                    maxResults: 100,
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                timeout: 50000
            });

            if (!response.data || !response.data.messages) {
                return res.status(404).json({ message: 'No messages found.' });
            }

            const messages = response.data.messages;
            const fullMessages = await Promise.all(messages.map(async (message) => {
                const msgResponse = await axios.get(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    }
                });
                return msgResponse.data;
            }));

            allMessages = allMessages.concat(fullMessages);
            nextPageToken = response.data.nextPageToken;
        } while (x--);

        const predictions = await executePython('../model/predict.py', allMessages);
        const filteredMessages = allMessages.filter((_, index) => predictions[index] === 1);

        // Prepare data to send to frontend
        const filteredMessagesWithDate = filteredMessages.map(message => ({
            ...message,
            receivedDate: new Date(parseInt(message.internalDate)), // Convert internalDate to Date object
        }));

        res.json(filteredMessagesWithDate);
    } catch (error) {
        console.error('Error retrieving emails:', error);
        res.status(500).json({ message: 'Oops! An error occurred. Please try again.' });
    }
};
