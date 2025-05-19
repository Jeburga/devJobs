const Vacante = require('../models/Vacantes');

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante'
    });
}

// agrega las vacantes a la base de datos
exports.agregarVacantes = async (req, res) => {
    const vacante = new Vacante(req.body);

    // Crear arreglo de habiilidades (skills)
    vacante.skills = req.body.skills.split();
    
    // almacenar en base de datos
    const nuevaVacante = await vacante.save();

    // redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);
}