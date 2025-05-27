const mongoose = require("mongoose");
const Usuarios = mongoose.model("Usuarios");

exports.formCrearCuenta = (req, res) => {
  res.render("crear-cuenta", {
    nombrePagina: "Crea tu cuenta en DevJobs",
    tagLine:
      "Comienza a publicar tus vacantes gratis, solo debes crear una cuenta",
  });
};

exports.validarRegistro = (req, res, next) => {
  // Sanitizar datos del registro
  req.sanitizeBody("nombre").escape();
  req.sanitizeBody("email").escape();
  req.sanitizeBody("password").escape();
  req.sanitizeBody("repetir").escape();

  // Validando datos del registro
  req.checkBody("nombre", "El nombre es obligatorio").notEmpty();
  req.checkBody("email", "El email debe ser valido").isEmail();
  req.checkBody("password", "El password no debe ir vacío").notEmpty();
  req.checkBody("confirmar", "Confirmar password no debe ir vacío").notEmpty();
  req.checkBody("confirmar", "El password es diferente").equals(req.body.password);

  const errores = req.validationErrors();

  if (errores) {
    // si hay errores
    req.flash("error", errores.map((error) => error.msg));
    res.render("crear-cuenta", {
      nombrePagina: "Crea tu cuenta en DevJobs",
      tagLine: "Comienza a publicar tus vacantes gratis, solo debes crear una cuenta",
      mensajes: req.flash(),
    });
    return;
  }
  next(); // si no hay errores
};

exports.crearUsuario = async (req, res, next) => {
  const usuario = new Usuarios(req.body);

  try {
    await usuario.save();
    res.redirect('/iniciar-sesion');
  } catch (error) {
    if (error.code === 11000) {
      req.flash('error', 'Ese correo ya está registrado');
      res.redirect('/crear-cuenta');
      return;
    }

    req.flash('error', error.message);
    res.redirect('/crear-cuenta');
  }
};

// Formulario para iniciar sesión
exports.formIniciarSesion = (req, res, next) => {
  res.render('iniciar-sesion', {
    nombrePagina: 'Iniciar Sesión DevJobs',
  })
}