const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const auth = async (req, res, next) => {
  // Check header for token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new Error('Invalid Authenticaton');
  }
  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.TOKEN_KEY);
    // Attach the user to route
    req.user = { username: payload.username };
    next();
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid token' });
  }
};

module.exports = auth;
