const Vacante = require("../models/Vacantes");

exports.formularioNuevaVacante = (req, res) => {
  res.render("nueva-vacante", {
    nombrePagina: "Nueva Vacante",
    tagline: "Llena el formulario y publica tu vacante",
  });
};

// agrega las vacantes a la base de datos
exports.agregarVacantes = async (req, res) => {
  console.log(req.body);

  try {
    console.log(req.body);

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
