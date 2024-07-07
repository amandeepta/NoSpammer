const express = require('express');
const router = express.Router();
const { email,
} = require('../controller/email');
const {
    isAuthenticated
} = require('../middleware/authentication')
router.get('/get',email);


module.exports = router;
