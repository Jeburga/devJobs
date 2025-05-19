const Vacante = require('../models/Vacantes');

exports.mostrarTrabajos = async (req, res, next) => {
    try {   
        const vacantes = await Vacante.find().lean();
        
        if(!vacantes) return next();
             
        res.render('home', {
            nombrePagina : 'devJobs',
            tagline: 'Encuentra y Publica Trabajos para Desarrolladores Web',
            barra: true,
            boton: true,
            vacantes,
        });
    } catch(error) {
        console.log(error);
        return next(error); 
    }
}