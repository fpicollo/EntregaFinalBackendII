require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const exphbs = require("express-handlebars");
const path = require("path");
const mongoose = require("mongoose");
const productsRouter = require("./routes/products");
const cartsRouter = require("./routes/carts");
const usersRouter = require("./routes/users");
const passport = require("./config/passport");
const authRouter = require("./routes/auth");

// Conectar a MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB Atlas"))
  .catch((err) => console.error("Error al conectar a MongoDB", err));

// Crear la app y el servidor HTTP
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Configurar Handlebars
const hbs = exphbs.create({});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware para JSON
app.use(express.json());

app.use(passport.initialize());
// Middleware para añadir `io` a las solicitudes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rutas para productos, carritos y usuarios
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", authRouter);

app.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", { title: "Productos en tiempo real" });
});

// Ruta principal para la vista de productos según carrito seleccionado
app.get("/", async (req, res) => {
  const { limit = 10, page = 1, cartId } = req.query;

  try {
    const limitParsed = parseInt(limit) || 10;
    const pageParsed = parseInt(page) || 1;
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limitParsed);
    const products = await Product.find()
      .skip((pageParsed - 1) * limitParsed)
      .limit(limitParsed);

    let cart;
    if (cartId) {
      cart = await Cart.findById(cartId).populate("products.product");
    } else {
      cart = new Cart({ products: [] });
      await cart.save();
    }

    res.render("home", {
      title: "Lista de productos",
      products,
      cartId: cart._id,
      totalPages,
      page: pageParsed,
      hasPrevPage: pageParsed > 1,
      hasNextPage: pageParsed < totalPages,
      prevLink:
        pageParsed > 1
          ? `/?limit=${limitParsed}&page=${pageParsed - 1}&cartId=${cart._id}`
          : null,
      nextLink:
        pageParsed < totalPages
          ? `/?limit=${limitParsed}&page=${pageParsed + 1}&cartId=${cart._id}`
          : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al cargar productos" });
  }
});

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");
  socket.emit("productList", []);
  socket.on("newProduct", (product) => {
    io.emit("productList", []);
  });
  socket.on("deleteProduct", (id) => {
    io.emit("productList", []);
  });
});

// Iniciar el servidor
httpServer.listen(8080, () => {
  console.log("Server running on port 8080");
});
