const UserDAO = require("../dao/UserDAO");
const UserDTO = require("../dao/UserDTO");
const User = require("../models/User");

class UserRepository {
  constructor() {
    this.userDAO = new UserDAO(User);
  }

  async getUserById(id) {
    const user = await this.userDAO.findById(id);
    return user ? new UserDTO(user) : null;
  }

  async createUser(data) {
    const user = await this.userDAO.create(data);
    return new UserDTO(user);
  }
}

module.exports = UserRepository;
