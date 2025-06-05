const mongoose = require("mongoose");
const multer = require('multer');
const shortid = require('shortid');
const { body, validationResult } = require('express-validator');

const Usuarios = mongoose.model("Usuarios");
// const Vacante = mongoose.model("Vacantes");

// Opciones de multer
const configuracionMulter = {
  limits: { fileSize: 100000 },// limitar tamaño de imágenes
  // determinar ubicacion de los archivos a guardas y reasignacion de nombre de archivo
  storage: fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname+'../../public/uploads/perfiles');
    },
    filename: (req, file, cb) => {
      const extension = file.mimetype.split('/')[1];
      cb(null, `${shortid.generate()}.${extension}`);
    }
  }),

  // filtrar que tipo de archivos se aceptarán
  fileFilter(req, file, cb) {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/svg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' ) {
      // se ejecuta el callback como true (si se acepta)
      cb(null, true);
    } else {
      cb(new Error('Formato no válido'), false);
    }
  }, 
}

const upload = multer(configuracionMulter).single('imagen');

// Subir imagen
exports.subirImagen = (req, res, next) => {
  upload(req, res, function(error) {
    if(error){ 
      if(error instanceof multer.MulterError){
        if(error.code === 'LIMIT_FILE_SIZE') {
          req.flash('error', 'El archivo es muy grande: Máximo 100kb');
        } else {
          req.flash('error', error.message);
        }
      } else {
        req.flash('error', error.message);
      }
      res.redirect('/administracion');
      return;
    } else {
      return next();
    }
  });
}

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
        usuario: req.user,
        imagen: req.user.imagen
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

  if(req.file){
    usuario.imagen = req.file.filename;
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

// Formulario para reestablecer password
exports.formReestablecerPassword = (req, res, ext) => {
  res.render('reestablecer-password', {
    nombrePagina: 'Reestablecer tu Password',
    tagLine: 'Si ya tienes una cuenta, pero olvidarte tu password, coloca tu email',
  })
}
