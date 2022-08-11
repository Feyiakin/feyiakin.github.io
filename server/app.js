require('dotenv').config();
require('./passport/setup');
const cookieParser = require('cookie-parser')
// require('./puppeteer/index');

const express = require('express');
const passport = require('passport');
const cookieSession = require('cookie-session');
const cors = require('cors');
const app = express();

const connectDB = require('./db/connect');

// Middlewares
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(cookieParser());
app.use(
  cookieSession({
    name: 'session',
    secret: process.env.COOKIE_SECRET,
    maxAge: 24 * 60 * 60 * 100,
    secure: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '50mb' }));
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
);

// Routers
const authRoute = require('./routes/auth');
const googleAuthRoute = require('./routes/google-auth');
const apiRoute = require('./routes/api');

// Routes
app.use('/', authRoute);
app.use('/auth/google', googleAuthRoute);
app.use('/api', apiRoute);

app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

const PORT = process.env.PORT || 3001;

const start = async () => {
  try {
    await connectDB;
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();
