const express = require('express');
const router = express.Router();

const authenticateUser = require('../middleware/authentication');

const { login, register, dashboard } = require('../controllers/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/dashboard', authenticateUser, dashboard);

module.exports = router;
