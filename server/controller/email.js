const { google } = require('googleapis');
const OAuthCredential = require('../models/OAuthCredential');

exports.email = async (req, res) => {
    try {
        // Ensure environment variables are correctly loaded and accessible
        console.log('Environment variables:', process.env);

        // Ensure OAuth credentials are correctly retrieved
        const oauthCredential = await OAuthCredential.findOne({ clientId: process.env.GOOGLE_CLIENT_ID });
        if (!oauthCredential || !oauthCredential.accessToken) {
            return res.status(401).json({ message: 'OAuth credentials not found or expired.' });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'http://localhost:3000/auth/google/callback'
        );

        oauth2Client.setCredentials({
            access_token: oauthCredential.accessToken,
            refresh_token: oauthCredential.refreshToken,
        });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const response = await gmail.users.messages.list({ userId: 'me' });
        const messages = response.data.messages;

        const filteredMessages = [];

        for (const message of messages) {
            const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });

            // Extract the email content
            const emailContent = msg.data.snippet;
            

            if (!isSpam) {
                filteredMessages.push(msg);
            }
        }

        res.json(filteredMessages);
    } catch (error) {
        console.error('Error retrieving emails:', error);
        res.status(500).json({ message: 'Failed to retrieve emails.' });
    }
};

exports.deleteEmail = async (req, res) => {
    try {
        const { messageId } = req.body;

        // Ensure OAuth credentials are correctly retrieved
        const oauthCredential = await OAuthCredential.findOne({ clientId: process.env.GOOGLE_CLIENT_ID });
        if (!oauthCredential || !oauthCredential.accessToken) {
            return res.status(401).json({ message: 'OAuth credentials not found or expired.' });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'http://localhost:3000/auth/google/callback'
        );

        oauth2Client.setCredentials({
            access_token: oauthCredential.accessToken,
            refresh_token: oauthCredential.refreshToken,
        });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        await gmail.users.messages.delete({ userId: 'me', id: messageId });

        res.status(200).json({ message: 'Email deleted successfully.' });
    } catch (error) {
        console.error('Error deleting email:', error);
        res.status(500).json({ message: 'Failed to delete email.' });
    }
};
