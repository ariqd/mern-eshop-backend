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

// Update user
router.put("/:id", async (req, res) => {
  const userExist = await User.findById(req.params.id);
  let newPassword;
  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = userExist.passwordHash;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    },
    { new: true }
  );

  if (!user) return res.status(400).send("the user cannot be created!");

  res.send(user);
});

// Delete user
router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user)
        return res.status(200).json({
          success: true,
          message: "The user is deleted!",
        });

      return res
        .status(404)
        .json({ success: false, message: "The user is not found" });
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

// User login
router.post("/login", async (req, res) => {
  // Get user by email
  const user = await User.findOne({ email: req.body.email });

  // Return 400 if user is not found
  if (!user) return res.status(400).send("User not found");

  // Failed if wrong password
  if (user && !bcrypt.compareSync(req.body.password, user.passwordHash))
    return res.status(200).send("Wrong email or password");

  // Create JWT Token
  const token = jwt.sign(
    { userId: user.id, isAdmin: user.isAdmin },
    process.env.secret,
    { expiresIn: "1d" }
  );

  // Return email and JWT Token
  return res.status(200).send({
    user: user.email,
    token: token,
  });
});

// Register user
router.post(`/register`, async (req, res) => {
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

// Get users count
router.get("/get/count", async (req, res) => {
  const userCount = await User.countDocuments((count) => count);

  if (!userCount) return res.status(500).json({ success: false });

  return res.send({
    userCount: userCount,
  });
});

module.exports = router;
