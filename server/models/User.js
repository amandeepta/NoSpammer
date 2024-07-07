const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        index: true, // Index for efficient querying
    },
    accessToken: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
        required: false,
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
