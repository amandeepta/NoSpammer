const mongoose = require('mongoose');

const OAuthCredentialSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
  },
  clientSecret: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
});

const OAuthCredential = mongoose.model('OAuthCredential', OAuthCredentialSchema);

module.exports = OAuthCredential;
