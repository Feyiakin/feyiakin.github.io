const { StatusCodes } = require('http-status-codes');
const connectDB = require('../db/connect');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'No username or password received' });
  }

  // Bcrypt password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Normalize user to insert into DB
  const user = {
    username: username.toLowerCase(),
    passwordHash,
  };

  // Insert user to DB
  connectDB.query('INSERT INTO users SET ?', [user], (err, result) => {
    if (err) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'Username invalid or already exists' });
    }
    console.log('User added to DB');
  });

  // Get saved user's data
  connectDB.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, result) => {
      if (err) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: 'Something went wrong fetching the user' });
      } else {
        // If user is found, create a JWToken
        const token = jwt.sign(
          { userId: result[0].id, username },
          process.env.TOKEN_KEY,
          {
            expiresIn: '24h',
          }
        );
        res.status(StatusCodes.CREATED).json({
          username,
          token,
        });
      }
    }
  );
};

const login = async (req, res) => {
  let { username, password } = req.body;
  username = username.toLowerCase();

  if (!username || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'No username or password received' });
  }

  // Find the user and check if it exists
  connectDB.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, result) => {
      if (err) {
        // If something goes wrong on our side
        console.log(err);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: 'Something went wrong. Try again' });
      } else if (result.length < 1) {
        // If the user doesn't exist
        console.log('User does not exist');
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ msg: 'Invalid Credentials' });
      } else {
        // If the user exist
        // Compare passwords
        const isPasswordCorrect = await bcrypt.compare(
          password,
          result[0].passwordHash
        );

        if (!isPasswordCorrect) {
          console.log('Wrong password');
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ msg: 'Invalid Credentials' });
        }

        // Create JWToken
        const token = jwt.sign(
          { userId: result[0].id, username },
          process.env.TOKEN_KEY,
          {
            expiresIn: '24h',
          }
        );

        res.status(StatusCodes.OK).json({
          user: { username },
          token,
          id: result[0].id,
        });
      }
    }
  );
};

const dashboard = async (req, res) => {
  const { username } = req.user;
  connectDB.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, result) => {
      // If user doesn't exist
      if (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          msg: 'Something went wrong. Try again',
        });
      } else if (result.length < 1) {
        // If user is not found
        return res.status(StatusCodes.NOT_FOUND).json({
          msg: 'Invalid user',
        });
      } else {
        // If user is found, check user's watchlist
        connectDB.query(
          'SELECT * FROM user_watch_list WHERE username = ?',
          [username],
          (err, watchlistResult) => {
            if (err) {
              console.log(err);
            } else if (watchlistResult.length < 1) {
              return res.status(StatusCodes.OK).json({
                username: result[0].username,
                watchlist: [],
              });
            } else {
              res.status(StatusCodes.OK).json({
                username: result[0].username,
                watchlist: watchlistResult,
              });
            }
          }
        );
      }
    }
  );
};

module.exports = {
  register,
  login,
  dashboard,
};
