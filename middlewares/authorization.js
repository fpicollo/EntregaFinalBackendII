const authorization = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }
    if (req.user.role !== role) {
      return res
        .status(403)
        .json({ message: "No tienes acceso a este recurso" });
    }
    next();
  };
};

module.exports = authorization;
