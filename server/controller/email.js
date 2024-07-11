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

const fetchMessages = async (accessToken, pageToken = null, maxResults = 50) => {
    const response = await axios.get('https://www.googleapis.com/gmail/v1/users/me/messages', {
        params: {
            pageToken,
            maxResults,
        },
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        timeout: 100000,
    });
    return response.data;
};

const fetchMessageDetails = async (accessToken, messageId) => {
    const response = await axios.get(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return response.data;
};

exports.email = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/google');
    }

    if (!req.user) {
        return res.status(500).json({ message: "User not authenticated" });
    }

    const accessToken = req.user.accessToken;
    const { pageToken } = req.query; // Extract pageToken from query parameters

    try {
        const response = await fetchMessages(accessToken, pageToken, 50); // Fetch messages based on pageToken

        if (!response || !response.messages) {
            return res.status(404).json({ message: 'No messages found.' });
        }

        const messages = response.messages;
        const allMessages = [];

        for (const message of messages) {
            const fullMessage = await fetchMessageDetails(accessToken, message.id);
            allMessages.push(fullMessage);
        }

        const predictions = await executePython('../model/predict.py', allMessages);
        const filteredMessages = allMessages.filter((_, index) => predictions[index] === 1);

        // Prepare data to send to frontend
        const filteredMessagesWithDate = filteredMessages.map(message => ({
            ...message,
            receivedDate: new Date(parseInt(message.internalDate)), // Convert internalDate to Date object
        }));

        // Construct response object with filtered messages and nextPageToken
        const responseToSend = {
            messages: filteredMessagesWithDate,
            nextPageToken: response.nextPageToken // Include nextPageToken in response
        };

        res.json(responseToSend);
    } catch (error) {
        console.error('Error retrieving emails:', error);
        res.status(500).json({ message: 'Oops! An error occurred. Please try again.' });
    }
};
