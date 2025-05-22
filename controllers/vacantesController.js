const Vacantes = require("../models/Vacantes");
const Vacante = require("../models/Vacantes");

exports.formularioNuevaVacante = ( req, res ) => {
  res.render("nueva-vacante", {
    nombrePagina: "Nueva Vacante",
    tagline: "Llena el formulario y publica tu vacante",
  });
};

// agrega las vacantes a la base de datos
exports.agregarVacantes = async ( req, res ) => {
  try {
    // Convertir skill a array si es un string
    if (typeof req.body.skill === 'string') {
      req.body.skill = req.body.skill.split(',').map(skill => skill.trim());
    }

    const vacante = new Vacante(req.body);
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
      nombrePagina: `Editar - ${vacante.titulo}`
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