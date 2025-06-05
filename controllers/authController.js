const passport = require('passport');
const crypto = require('crypto');
const Vacante = require("../models/Vacantes");
const Usuario = require('../models/Usuarios');
const enviarEmail = require('../handlers/email');

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

exports.formReestablecerPassword = (req, res) => {
    res.render('reestablecer-password', {
        nombrePagina: 'Reestablece tu Password',
        tagLine: 'Si ya tienes una cuenta pero olvidaste tu contraseña, aquí es donde debes estar'
    })
}

exports.enviarToken = async (req, res) => {
    const usuario = await Usuario.findOne({ email: req.body.email });
    
    if(!usuario){
        req.flash('error', 'No existe cuenta con ese correo');
        return res.redirect('/reestablecer-password');
    }
    // si el usuario existe se genera token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    // Guardar el usuario
    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

    // Enviar notificación por email
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });

    // Todo correcto
    req.flash('correcto', 'Revisa tu email para las indicaciones');
    res.redirect('/iniciar-sesion');
}

// Verificar si el token es válido y verificar que user existe
exports.reestablecerPassword = async (req, res, next) => {
    const usuario = await Usuario.findOne({ 
        token: req.params.token,
        expira: {
            $gt : Date.now()
        }
    });

    if(!usuario){
        req.flash('error', 'El formulario ya no es válido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }

    // Todo bien, mostrar el formulario
    res.render('nuevo-password', {
        nombrePagina: 'Nuevo Password'
    })
}

// Almacena nuevo password en BD
exports.guardarPassword = async (req, res) => {
    const usuario = await Usuario.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    if(!usuario){
        req.flash('error', 'El formulario ya no es válido');
        return res.redirect('/reestablecer-password')
    }

    // Asignar nuevo password, limpiar valores previos
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    //Guardar
    usuario.save();

    // Mensaje y redirección
    req.flash('correcto', 'Password modificado correctamente');
    res.redirect('/iniciar-sesion')
}