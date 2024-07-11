const axios = require('axios');
const fetchMessages = async (accessToken, pageToken = null, maxResults = 50) => {
    const retryLimit = 3; // Number of retries
    let retryCount = 0;
    let lastError = null;

    while (retryCount < retryLimit) {
        try {
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
        } catch (error) {
            lastError = error;
            console.error('Error fetching messages:', error);
            retryCount++;
        }
    }

    throw lastError; // Throw the last error if retries are exhausted
};

module.exports.fetchMessages = fetchMessages;