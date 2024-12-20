const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = express.Router();

// Crear un usuario
router.post("/", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, cart, role } =
      req.body;
    const user = new User({
      first_name,
      last_name,
      email,
      age,
      password,
      cart,
      role,
    });
    await user.save();
    res.status(201).json({ status: "success", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Leer todos los usuarios
router.get("/", async (req, res) => {
  try {
    const users = await User.find().populate("cart");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Leer un usuario por ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("cart");
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Actualizar un usuario
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Eliminar un usuario
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
