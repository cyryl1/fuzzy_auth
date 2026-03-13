const mongoose = require("mongoose");

async function connectDB(uri) {
  const conn = await mongoose.connect(uri);
  return conn;
}

module.exports = connectDB;
