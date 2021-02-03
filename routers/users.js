const { User } = require("../models/user");
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Get all users (without password)
router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    res.status(500).json({ success: false });
  }

  res.send(userList);
});

// Get user by ID (without password)
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user)
    return res.status(500).send("The user with the given ID was not found.");

  res.status(200).send(user);
});

// Insert user
router.post(`/`, async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    street: req.body.street,
    apartement: req.body.apartement,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    isAdmin: req.body.isAdmin,
  });

  user = await user.save();

  if (!user) return res.status(404).send("The user cannot be created");

  res.send(user);
});

router.post("/login", async (req, res) => {
  // Get user by email
  const user = await User.findOne({ email: req.body.email });

  // Return 400 if user is not found
  if (!user) return res.status(400).send("User not found");

  // Failed if wrong password
  if (user && !bcrypt.compareSync(req.body.password, user.passwordHash))
    return res.status(200).send("Wrong email or password");

  // Create JWT Token
  const token = jwt.sign({ userId: user.id }, process.env.secret, { expiresIn: "1d" });

  // Return email and JWT Token
  return res.status(200).send({
    user: user.email,
    token: token,
  });
});

module.exports = router;
