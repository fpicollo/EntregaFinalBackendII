const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const passport = require("passport");
const authorization = require("../middlewares/authorization");

// GET /api/products - Obtener productos (disponible para todos los usuarios autenticados)
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let { limit = 10, page = 1, sort, query } = req.query;
      limit = parseInt(limit) || 10;
      page = parseInt(page) || 1;

      let filter = {};
      if (query) {
        filter = { $or: [{ category: query }, { status: query === "true" }] };
      }

      let productsQuery = Product.find(filter);
      if (sort) {
        const sortOrder = sort === "asc" ? 1 : -1;
        productsQuery = productsQuery.sort({ price: sortOrder });
      }

      const totalProducts = await Product.countDocuments(filter);
      const totalPages = Math.ceil(totalProducts / limit);

      const products = await productsQuery
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      res.json({
        status: "success",
        payload: products,
        totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
        page,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
        prevLink:
          page > 1 ? `/api/products?limit=${limit}&page=${page - 1}` : null,
        nextLink:
          page < totalPages
            ? `/api/products?limit=${limit}&page=${page + 1}`
            : null,
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

// POST /api/products - Crear un producto (solo para admin)
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorization("admin"),
  async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } =
      req.body;

    if (!title || !description || !code || !price || !stock || !category) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    try {
      const newProduct = new Product({
        title,
        description,
        code,
        price,
        stock,
        category,
        thumbnails: thumbnails || [],
      });

      await newProduct.save();
      res.status(201).json({ status: "success", product: newProduct });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

// DELETE /api/products/:id - Eliminar un producto (solo para admin)
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorization("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      res.json({ message: "Producto eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
