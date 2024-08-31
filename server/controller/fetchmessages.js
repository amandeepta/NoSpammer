const axios = require('axios');

const fetchMessages = async (accessToken, pageToken = null, maxResults = 50) => {
    try {
        const response = await axios.get('https://www.googleapis.com/gmail/v1/users/me/messages', {
            params: {
                pageToken,
                maxResults,
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            timeout: 50000,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
};

module.exports.fetchMessages = fetchMessages;
