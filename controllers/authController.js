const passport = require('passport');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect : '/administracion',
    failureRedirect : '/iniciar-sesion', 
    failureFlash: true,
    badRequestMessage : 'Ambos campos son obligatorios'
})

// Revisar si el usuario está autenticado o no
exports.verificarUsuario = (req, res, next) => {

    // Revisar el usuario
    if(req.isAuthenticated()) {
        return next();
    }

    // Redireccionar
    res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = ( req, res ) => {
    res.render('administracion', {
        nombrePagina: 'Panel de Administración',
        tagLine: 'Crea y administra tus vacantes desde aquí'
    })
}