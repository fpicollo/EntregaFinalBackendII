const Cart = require("../models/Cart");

class CartRepository {
  async findById(id) {
    return await Cart.findById(id).populate("products.product");
  }

  async update(id, data) {
    return await Cart.findByIdAndUpdate(id, data, { new: true });
  }

  async create(data) {
    return await Cart.create(data);
  }
}

module.exports = CartRepository;
