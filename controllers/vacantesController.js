const Vacante = require("../models/Vacantes");
const multer = require('multer');
const shortid = require('shortid');

exports.formularioNuevaVacante = (req, res) => {
  res.render("nueva-vacante", {
    nombrePagina: "Nueva Vacante",
    tagline: "Llena el formulario y publica tu vacante",
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen
  });
};

// Validar y sanitizar los campos de las nuevas vacantes
const { body, validationResult } = require("express-validator");
const Vacantes = require("../models/Vacantes");

exports.validarVacante = [
  body("titulo")
    .notEmpty()
    .withMessage("Agregar un Titulo a la Vacante")
    .escape(),
  body("empresa").notEmpty().withMessage("Agregar una Empresa").escape(),
  body("ubicacion").notEmpty().withMessage("Agregar una Ubicacion").escape(),
  body("salario").optional().escape(),
  body("contrato")
    .notEmpty()
    .withMessage("Selecciona el tipo de contrato")
    .escape(),
  body("skills")
    .notEmpty()
    .withMessage("Agregar al menos una habilidad")
    .escape(),

  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      const mensajes = errores.array().map((error) => error.msg);
      req.flash("error", mensajes);
      return res.render("nueva-vacante", {
        nombrePagina: "Nueva Vacante",
        tagline: "Llena el formulario y publica tu vacante",
        cerrarSesion: true,
        nombre: req.user ? req.user.nombre : "",
        mensajes: req.flash(),
      });
    }
    next();
  },
];

// agrega las vacantes a la base de datos
exports.agregarVacantes = async (req, res) => {
  try {
    // Convertir skill a array si es un string
    if (typeof req.body.skill === "string") {
      req.body.skill = req.body.skill.split(",").map((skill) => skill.trim());
    }
    const vacante = new Vacante(req.body);

    // usuario autor de la vacante
    vacante.autor = req.user._id;

    await vacante.save();

    res.redirect(`/vacantes/${vacante.url}`);
  } catch (error) {
    console.log("Error al guardar la vacante:", error);
    res.send("Error al guardar");
  }
};

exports.mostrarVacante = async (req, res, next) => {
  try {
    const vacante = await Vacante.findOne({ url: req.params.url }).lean().populate('autor');

    console.log(vacante);
    
    if (!vacante) return next();

    res.render("vacantes", {
      vacante,
      nombrePagina: vacante.titulo,
      barra: true,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.formEditarVacante = async (req, res, next) => {
  try {
    const vacante = await Vacante.findOne({ url: req.params.url }).lean();

    if (!vacante) return next();

    res.render("editar-vacante", {
      vacante,
      nombrePagina: `Editar - ${vacante.titulo}`,
      cerrarSesion: true,
      nombre: req.user.nombre,
      imagen: req.user.imagen
    });
  } catch (error) {
    console.log("No se pudo editar vacante:  " + error);
  }
};

exports.editarVacante = async (req, res, next) => {
  try {
    const vacanteActualizada = req.body;
    vacanteActualizada.skills = req.body.skill.split(",");
    const vacante = await Vacante.findOneAndUpdate(
      { url: req.params.url },
      vacanteActualizada,
      {
        new: true,
        runValidators: true,
      }
    );

    res.redirect(`/vacantes/${vacante.url}`);
  } catch (error) {
    console.log(error);
  }
};

// Eliminar vacantes
exports.eliminarVacante = async (req, res) => {
  const { _id } = req.params;

  try {
    const vacante = await Vacante.findById(_id);

    if (verificarAutor(vacante, req.user)) {
      // si es el usuario, eliminar
      await vacante.deleteOne();
      res.status(200).send("Vacante Eliminada Correctamente");
    } else {
      // no es usuario, no permitido
      res.status(403).send("Error");
    }
  } catch (error) {
    console.log("No se pudo ejecutar función: ", error);
  }
};

const verificarAutor = (vacante = {}, usuario = {}) => {
  if (!vacante.autor.equals(usuario._id)) {
    return false;
  }
  return true;
};

//Subir archivos en PDF
exports.subirCV = (req, res, next) => {
    upload(req, res, function(error) {
    if(error){ 
      if(error instanceof multer.MulterError){
        if(error.code === 'LIMIT_FILE_SIZE') {
          req.flash('error', 'El archivo es muy grande: Máximo 150kb');
        } else {
          req.flash('error', error.message);
        }
      } else {
        req.flash('error', error.message);
      }
      res.redirect(`/vacantes/${req.params.url}`);
      return;
    } else {
      return next();
    }
  });
}

const configuracionMulter = {
  limits: { fileSize: 150000 },// limitar tamaño de imágenes
  // determinar ubicacion de los archivos a guardas y reasignacion de nombre de archivo
  storage: fileStorage = multer.diskStorage({

    destination: (req, file, cb) => {
      cb(null, __dirname+'../../public/uploads/cv');
    },

    filename: (req, file, cb) => {
      const extension = file.mimetype.split('/')[1];
      cb(null, `${shortid.generate()}.${extension}`);
    }

  }),

  // filtrar que tipo de archivos se aceptarán
  fileFilter(req, file, cb) {
    if(file.mimetype === 'application/pdf' ) {
      cb(null, true);
    } else {
      cb(new Error('Formato no válido'), false);
    }
  }, 
}

const upload = multer(configuracionMulter).single('cv');

// Almacenar los candidatos en BD  
exports.contactar = async (req, res, next) => {
  
  const vacante = await Vacante.findOne({ url: req.params.url });

  if(!vacante) return next(); // si vacante no existe

  // si todo está bien
  const nuevoCandidato = {
    nombre: req.body.nombre,
    email: req.body.email,
    cv: req.file.filename
  }
  
  // Almacenar vacante
  vacante.candidatos.push(nuevoCandidato);
  await vacante.save();

  // Mensaje flas y redirect
  req.flash('correcto', 'Se envió su CV correctamente');
  res.redirect('/');
}

// Mostrar candidatos
exports.mostrarCandidatos = async (req, res, next) => {
  const vacante = await Vacante.findById(req.params.id).lean();

  if(vacante.autor != req.user._id.toString()) {
    next(); 
  } 

  if(!vacante) return next();

  res.render('candidatos', {
    nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
    candidatos: vacante.candidatos
  })
}

// buscador de vacantes
exports.buscarVacantes = async (req, res) => {
  const vacantes = await Vacante.find({
    $text: {
      $search: req.body.q
    }
  }).lean();

  // mostrar vacantes
  res.render('home', {
    nombrePagina: `Resultados para la búsqueda:  ${req.body.q}`,
    barra: true,
    vacantes
  })
  
}