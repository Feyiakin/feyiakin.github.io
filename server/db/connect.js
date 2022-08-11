const mysql = require('mysql');

const connectDB = mysql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

connectDB.connect((err) => {
  if (err) throw err;
  console.log('Connected to DB');
});

module.exports = connectDB;
