require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/User");
const UserRepository = require("../repositories/UserRepository");

const userRepository = new UserRepository();

const router = express.Router();

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const userDTO = await userRepository.getUserById(req.user._id);
    res.json(userDTO);
  }
);

// Login del usuario
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    res.cookie("jwt", token, { httpOnly: true });
    res.json({ message: "Login exitoso", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener datos del usuario actual
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(req.user);
  }
);

module.exports = router;
