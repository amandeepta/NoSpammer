const { google } = require('googleapis');
const axios = require('axios');
const User = require('../models/User');
const { spawn } = require('child_process');

const executePython = async (script, args) => {
    const arguments = args.map(arg => arg.toString());

    const py = spawn("python", [script, ...arguments]);

    const result = await new Promise((resolve, reject) => {
        let output = '';

        py.stdout.on('data', (data) => {
            output += data; // Collecting output as string
        });

        py.stderr.on("data", (data) => {
            console.error(`[python] Error occurred: ${data}`);
            reject(`Error occurred in ${script}`);
        });

        py.on("exit", (code) => {
            
            try {
                resolve(output == 1); // Convert to boolean based on integer value
            } catch (e) {
                reject(`Failed to parse Python script output: ${output}`);
            }

        });
    });

    return result;
}


exports.email = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect('/auth/google');
        }

        if (!req.user) {
            throw new Error("req.user is not defined");
        }
        const accessToken = req.user.accessToken;
        const response = await axios.get('https://www.googleapis.com/gmail/v1/users/me/messages', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.data || !response.data.messages) {
            console.error('No messages found');
            return res.status(404).json({ message: 'No messages found.' });
        }

        const messages = response.data.messages;
        const filteredMessages = [];

        for (const message of messages) {
            const msgResponse = await axios.get(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            const msg = msgResponse.data;

            // Extract the email content
            const emailContent = msg;

            try {
                const isSpam = await executePython('../model/predict.py', [emailContent]);
                console.log(isSpam);
                if (isSpam) {
                    console.log("found");
                    filteredMessages.push(msg);
                }
            } catch (pythonError) {
                console.error(`Error executing Python script for message ID ${message.id}:`, pythonError);
                return res.status(500).json({ message: 'Error executing Python script.' });
            }
        }

        res.json(filteredMessages);
    } catch (error) {
        console.error('Error retrieving emails:', error);
        res.status(500).json({ message: 'Failed to retrieve emails.' });
    }
};

