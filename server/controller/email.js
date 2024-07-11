const { google } = require('googleapis');
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { fetchMessages } = require('./fetchmessages');

const executePython = async (script, input) => {
    const tempFilePath = path.join(__dirname, 'temp_emails.json');
    
    // Log the path where the file will be created
    console.log(`Creating temp file at: ${tempFilePath}`);
    fs.writeFileSync(tempFilePath, JSON.stringify(input));

    // Check if the file exists after writing
    if (!fs.existsSync(tempFilePath)) {
        throw new Error(`Failed to create temp file at ${tempFilePath}`);
    }

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

const fetchMessageDetails = async (accessToken, messageId, retries = 5) => {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 429) {
                const retryAfter = error.response.headers['retry-after']
                    ? parseInt(error.response.headers['retry-after']) * 1000
                    : (2 ** i) * 1000;
                console.warn(`Rate limit exceeded. Retrying after ${retryAfter}ms...`);
                await delay(retryAfter);
            } else {
                throw error;
            }
        }
    }

    throw new Error(`Failed to fetch message details after ${retries} retries`);
};

exports.email = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/google');
    }

    if (!req.user) {
        return res.status(500).json({ message: "User not authenticated" });
    }

    const accessToken = req.user.accessToken;
    const { pageToken } = req.query;

    try {
        const response = await fetchMessages(accessToken, pageToken, 50);

        if (!response || !response.messages) {
            return res.status(404).json({ message: 'No messages found.' });
        }

        const messages = response.messages;
        const allMessages = [];

        for (const message of messages) {
            try {
                const fullMessage = await fetchMessageDetails(accessToken, message.id);
                allMessages.push(fullMessage);
            } catch (error) {
                console.error('Error fetching message details:', error);
            }
        }

        const predictions = await executePython('../model/predict.py', allMessages);
        const filteredMessages = allMessages.filter((_, index) => predictions[index] === 1);

        const filteredMessagesWithDate = filteredMessages.map(message => ({
            ...message,
            receivedDate: new Date(parseInt(message.internalDate)),
        }));

        const responseToSend = {
            messages: filteredMessagesWithDate,
            nextPageToken: response.nextPageToken
        };

        res.json(responseToSend);
    } catch (error) {
        console.error('Error retrieving emails:', error);
        res.status(500).json({ message: 'Oops! An error occurred. Please try again.' });
    }
};