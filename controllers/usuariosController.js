const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');

exports.formCrearCuenta = ( req, res ) => {

    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en DevJobs',
        tagLine: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
    })
}

exports.validarRegistro = ( req, res, next ) => {

    // sanitizar
    req.sanitizeBody('nombre').escape();
    console.log(req.body);
    


    req.checkBody('nombre', 'El nombre es obligatorio').notEmpty();

    const errores = req.validationErrors();
    console.log(errores);
    return;
}

exports.crearUsuario = async (req, res, next ) => {
    const usuario = new Usuarios(req.body);

    const nuevoUsuario = await usuario.save();
    if(!nuevoUsuario){
        return next()
    } 

    res.redirect('/iniciar-sesion');
    
}