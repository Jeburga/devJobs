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
