const Product = require("../models/Product");

class ProductRepository {
  async findById(id) {
    return await Product.findById(id);
  }

  async update(id, data) {
    return await Product.findByIdAndUpdate(id, data, { new: true });
  }

  async create(data) {
    return await Product.create(data);
  }

  async delete(id) {
    return await Product.findByIdAndDelete(id);
  }
}

module.exports = ProductRepository;
