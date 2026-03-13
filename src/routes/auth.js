const express = require("express");
const rateLimit = require("express-rate-limit");
const { registrationRules, loginRules, validate } = require("../middleware/validate");
const { register, login } = require("../controllers/authController");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});

router.post("/register", authLimiter, registrationRules, validate, register);
router.post("/login", authLimiter, loginRules, validate, login);

module.exports = router;
