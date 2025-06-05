const passport = require('passport');
const Vacante = require("../models/Vacantes");
const enviarEmail = require('../handlers/email');
const crypto = require('crypto');

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

exports.mostrarPanel = async ( req, res ) => {

    // Consultar el usuario autenticado
    const vacantes = await Vacante.find({ autor: req.user._id }).lean();

    console.log(vacantes);
    

    res.render('administracion', {
        nombrePagina: 'Panel de Administración',
        tagLine: 'Crea y administra tus vacantes desde aquí',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes
    })
}

exports.cerrarSesion = (req, res, next) => {
    req.logout(function (err) {
        if(err){
            return next(err);
        }        
        req.flash('correcto', 'cerraste sesión correctamente')
        return res.redirect('/iniciar-sesion');
    });
}


// Genera el token en la tabla del usuario
exports.enviarToken = async (req, res) => {
  const usuario = await Usuarios.findOne({ email: req.body.email });

  if (!usuario) {
    req.flash('error', 'No existe un usuario registrado con ese correo');
    return res.redirect('/iniciar-sesion')
  }

  // Si usuario existe
  usuario.token = crypto.randomBytes(20).toString('hex'); // permite generar un código token en una línea
  usuario.expira = Date.now() + 3600000;

  // Guardar usuario
  await usuario.save();
  const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

  console.log(resetUrl);

  // Enviar notificación por email
  await enviarEmail.envier({
    usuario,
    subject: 'Password Reset',
    resetUrl,
    archivo: 'reset'
  })

  // Todo correcto
  req.flash('correcto', 'Revisa tu E-mail para seguir las indicaciones');
  res.redirect('/iniciar-sesion')
  
}