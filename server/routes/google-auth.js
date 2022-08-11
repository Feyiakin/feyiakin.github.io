var express = require('express');
var passport = require('passport');

var router = express.Router();

router.get('/', passport.authenticate('google', { scope: ['profile'] }));

router.get('/error', (req, res) =>
  res.status(401).json({
    success: false,
    message: 'user failed to authenticate.',
  })
);

router.get(
  '/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000/auth/google/error',
  }),
  function (req, res) {
    // Successful authentication, redirect secrets.
    let { user } = req;

    res.cookie('username', user.username);
    res.cookie('token', user.token);
    res.redirect('http://localhost:3000/auth-redirect');
  }
);

module.exports = router;
