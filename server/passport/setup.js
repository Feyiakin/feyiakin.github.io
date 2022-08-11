const passport = require('passport');
const connectDB = require('../db/connect');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3001/auth/google/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      const username = profile.displayName.replace(/\s/g, '');
      // Check if user already exists
      connectDB.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, result) => {
          if (err) {
            // If something goes wrong on our side
            console.log(err);
            return res
              .status(StatusCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: 'Something went wrong. Try again' });
          } else if (result.length < 1) {
            // If the user doesn't exist, create one
            const user = {
              username: username.toLowerCase(),
              passwordHash: 'ThisIsARandomString',
            };
            // Insert user to DB
            connectDB.query(
              'INSERT INTO users SET ?',
              [user],
              (err, result) => {
                if (err) {
                  return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({ msg: 'Username invalid or already exists' });
                }

                // Get saved user's data
                connectDB.query(
                  'SELECT * FROM users WHERE username = ?',
                  [username],
                  (err, result) => {
                    if (err) {
                      return res
                        .status(StatusCodes.INTERNAL_SERVER_ERROR)
                        .json({
                          msg: 'Something went wrong fetching the user',
                        });
                    } else {
                      // Create a JWToken
                      const token = jwt.sign(
                        { userId: result[0].id, username },
                        process.env.TOKEN_KEY,
                        {
                          expiresIn: '24h',
                        }
                      );
                      profile = { username, token };
                      return done(null, profile);
                    }
                  }
                );
                console.log('User added to DB');
              }
            );
          } else {
            // If the user exist
            // Create JWToken
            const token = jwt.sign(
              { userId: result[0].id, username },
              process.env.TOKEN_KEY,
              {
                expiresIn: '24h',
              }
            );
            profile = { username, token };
            return done(null, profile);
          }
        }
      );
    }
  )
);
