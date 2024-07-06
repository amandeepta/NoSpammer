const express = require('express');
const router = express.Router();
const { email, deleteEmail
} = require('../controller/email');

router.get('/emails', email);
router.post('/emails/delete', deleteEmail);

module.exports = router;
