const express = require("express");

const app = express();

app.use(express.json());

app.use("/auth", require("./routes/auth"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

module.exports = app;
