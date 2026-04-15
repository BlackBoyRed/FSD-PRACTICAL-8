const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

// REGISTER
router.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 })
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    try {
      const { email, password } = req.body;

      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: "User already exists" });

      const hashed = await bcrypt.hash(password, 10);

      user = new User({ email, password: hashed });
      await user.save();

      res.json({ msg: "User Registered" });

    } catch (err) {
      res.status(500).send("Server Error");
    }
  }
);

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Wrong password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;