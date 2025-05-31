const Vacante = require("../models/Vacantes");

exports.formularioNuevaVacante = ( req, res ) => {
  res.render("nueva-vacante", {
    nombrePagina: "Nueva Vacante",
    tagline: "Llena el formulario y publica tu vacante",
    cerrarSesion: true, 
    nombre: req.user.nombre,
  });
};

// Validar y sanitizar los campos de las nuevas vacantes
const { body, validationResult } = require('express-validator');

exports.validarVacante = [
  body('titulo').notEmpty().withMessage('Agregar un Titulo a la Vacante').escape(),
  body('empresa').notEmpty().withMessage('Agregar una Empresa').escape(),
  body('ubicacion').notEmpty().withMessage('Agregar una Ubicacion').escape(),
  body('salario').optional().escape(),
  body('contrato').notEmpty().withMessage('Selecciona el tipo de contrato').escape(),
  body('skills').notEmpty().withMessage('Agregar al menos una habilidad').escape(),

  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      const mensajes = errores.array().map(error => error.msg);
      req.flash('error', mensajes);
      return res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user ? req.user.nombre : '',
        mensajes: req.flash()
      });
    }
    next();
  }
];

// agrega las vacantes a la base de datos
exports.agregarVacantes = async ( req, res ) => {
  try {
    // Convertir skill a array si es un string
    if (typeof req.body.skill === 'string') {
      req.body.skill = req.body.skill.split(',').map(skill => skill.trim());
    }

    const vacante = new Vacante(req.body);

    // usuario autor de la vacante
    vacante.autor = req.user._id;

    await vacante.save();

    res.redirect(`/vacantes/${vacante.url}`);
  } catch (error) {
    console.log('Error al guardar la vacante:', error);
    res.send('Error al guardar');
  }
};

exports.mostrarVacante = async ( req, res, next ) => {
  try {
    const vacante = await Vacante.findOne({ url: req.params.url }).lean();
    if( !vacante ) return next();

    res.render('vacantes', {
      vacante,
      nombrePagina: vacante.titulo,
      barra: true
    })
    
  } catch(error){
    console.log(error);
    
  }
}

exports.formEditarVacante = async ( req, res, next ) => {
  try {
    const vacante = await Vacante.findOne({ url: req.params.url }).lean();

    if(!vacante) return next();

    res.render('editar-vacante', {
      vacante,
      nombrePagina: `Editar - ${vacante.titulo}`,
      cerrarSesion: true, 
      nombre: req.user.nombre,
    })
  } catch (error) {
    console.log('No se pudo editar vacante:  ' +  error);
    
  }
}

exports.editarVacante = async ( req, res, next ) => {
  try {

    const vacanteActualizada = req.body;
    vacanteActualizada.skills = req.body.skill.split(',');
    const vacante = await Vacante.findOneAndUpdate( {url: req.params.url}, vacanteActualizada, {
      new: true,
      runValidators: true,
    } );

    res.redirect(`/vacantes/${vacante.url}`);

  } catch(error) {
    console.log(error);
  }
}

// Eliminar vacantes
exports.eliminarVacante = async ( req, res ) => {
  const { id } = req.params;

  res.status(200).send('Vacante Eliminada Correctamente');
  
}
