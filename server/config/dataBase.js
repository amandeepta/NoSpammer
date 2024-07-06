const mongoose = require('mongoose');
require('dotenv').config();


const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL1);
        console.log('Database connection is successful');
    } catch (error) {
        console.error('Failed to connect to the database:');
        console.error(error.stack || error.message);
        process.exit(1);
    }
};

// Export the function
module.exports = dbConnect;
