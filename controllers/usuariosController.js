const mongoose = require("mongoose");
const Usuarios = mongoose.model("Usuarios");
const { body, validationResult } = require('express-validator');

exports.formCrearCuenta = (req, res) => {
  res.render("crear-cuenta", {
    nombrePagina: "Crea tu cuenta en DevJobs",
    tagLine:
      "Comienza a publicar tus vacantes gratis, solo debes crear una cuenta",
  });
};


exports.validarRegistro = [
  // Sanitizar datos del registro
  body("nombre").notEmpty().withMessage("El nombre es obligatorio").escape(),
  body("email").isEmail().withMessage("El email debe ser valido").escape(),
  body("password").notEmpty().withMessage("El password no debe ir vacío").escape(),
  body("repetir")
    .notEmpty()
    .withMessage("Confirmar password no debe ir vacío")
    .custom((value, {req}) => {
      if (value !== req.body.password) {
        throw new Error("El password es diferente");
      }
    })
    .escape(),

   (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      req.flash("error", errores.array().map((error) => error.msg));
      return res.render("crear-cuenta", {
        nombrePagina: "Crea tu cuenta en DevJobs",
        tagLine: "Comienza a publicar tus vacantes gratis, solo debes crear una cuenta",
        mensajes: req.flash(),
      });
    }
    next();
  }
];

// exports.validarRegistro = (req, res, next) => {
//   // Sanitizar datos del registro
//   req.sanitizeBody("nombre").escape();
//   req.sanitizeBody("email").escape();
//   req.sanitizeBody("password").escape();
//   req.sanitizeBody("repetir").escape();

//   // Validando datos del registro
//   req.checkBody("nombre", "El nombre es obligatorio").notEmpty();
//   req.checkBody("email", "El email debe ser valido").isEmail();
//   req.checkBody("password", "El password no debe ir vacío").notEmpty();
//   req.checkBody("confirmar", "Confirmar password no debe ir vacío").notEmpty();
//   req.checkBody("confirmar", "El password es diferente").equals(req.body.password);

//   const errores = req.validationErrors();

//   if (errores) {
//     // si hay errores
//     req.flash("error", errores.map((error) => error.msg));
//     res.render("crear-cuenta", {
//       nombrePagina: "Crea tu cuenta en DevJobs",
//       tagLine: "Comienza a publicar tus vacantes gratis, solo debes crear una cuenta",
//       mensajes: req.flash(),
//     });
//     return;
//   }
//   next(); // si no hay errores
// };

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

// Form editar el perfil
exports.formEditarPerfil = (req, res) => {

  console.log('usuario en sesión: ', req.user);
  
    res.render('editar-perfil', {
        nombrePagina : 'Edita tu perfil en DevJobs',
        cerrarSesion: true, 
        nombre: req.user.nombre,
        usuario: req.user
  })
}

// Guardar cambios de editar perfil
exports.editarPerfil = async (req, res) => {
  const usuario = await Usuarios.findById(req.user._id);

  usuario.nombre = req.body.nombre;
  usuario.email = req.body.email;

  if (req.body.password) {
    usuario.password = req.body.password;
  }

  await usuario.save();

  req.flash('correcto', 'Cambios guardados correctamente')

  res.redirect('/administracion');
};

// Sanitizar y validar formulario de editar clientes
exports.validarPerfil = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre no puede ir vacío')
    .escape(),
  
  body('email')
    .notEmpty().withMessage('El correo no puede ir vacío')
    .isEmail().withMessage('Agregar un correo válido')
    .normalizeEmail()
    .escape(),

  body('password')
    .optional({ checkFalsy: true})
    .isLength({ min: 6 }).withMessage('Tienes que colocar una password de al menos 6 carácteres')
    .escape(),

  (req, res, next) => {
    const errores = validationResult(req);

   if (!errores.isEmpty()) {
      req.flash("error", errores.array().map((error) => error.msg));
      return res.render("editar-perfil", {
        nombrePagina: "Editar Perfil",
        tagLine: "Modifica la información de tu cuenta",
        mensajes: req.flash(),
      });
    }
    next();
  }
];