const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const cors = require('cors');
const axios = require('axios');
const joblib = require('joblib');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Load the trained model and vectorizer
const clf = joblib.load('spam_classifier.pkl');
const vectorizer = joblib.load('vectorizer.pkl');

// Google OAuth2 setup
const oAuth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'YOUR_REDIRECT_URI'
);

app.post('/authenticate', (req, res) => {
  const { code } = req.body;
  oAuth2Client.getToken(code, (err, tokens) => {
    if (err) {
      return res.status(400).json({ error: 'Error retrieving access token' });
    }
    oAuth2Client.setCredentials(tokens);
    res.json(tokens);
  });
});

app.get('/messages', async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const response = await gmail.users.messages.list({ userId: 'me', q: 'is:unread' });
    const messages = response.data.messages || [];
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

app.get('/message/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const message = await gmail.users.messages.get({ userId: 'me', id });
    res.json(message.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching message' });
  }
});

app.post('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    await gmail.users.messages.delete({ userId: 'me', id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting message' });
  }
});

app.post('/classify', async (req, res) => {
  try {
    const { text } = req.body;
    const emailVec = vectorizer.transform([text]);
    const prediction = clf.predict(emailVec)[0];
    res.json({ isSpam: prediction === 1 });
  } catch (error) {
    res.status(500).json({ error: 'Error classifying message' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
