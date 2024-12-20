const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/User");

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token del encabezado Authorization
  secretOrKey: process.env.SECRET_KEY, // Usa la clave secreta definida en el archivo .env
};

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      const user = await User.findById(payload.id); // Busca al usuario en la base de datos
      if (user) {
        return done(null, user); // El usuario se asignará a req.user
      } else {
        return done(null, false); // Si no se encuentra el usuario, retorna falso
      }
    } catch (error) {
      return done(error, false); // Manejo de errores
    }
  })
);

module.exports = passport;
