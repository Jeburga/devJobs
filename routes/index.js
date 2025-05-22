const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    // crear vacantes
    router.get('/vacantes/nueva', vacantesController.formularioNuevaVacante)
    router.post('/vacantes/nueva', vacantesController.agregarVacantes);

    // Mostrar vacante
    router.get('/vacantes/:url', vacantesController.mostrarVacante);

    // Editar vacante
    router.get('/vacantes/editar/:url', vacantesController.formEditarVacante);
    router.post('/vacantes/editar/:url', vacantesController.editarVacante);

    // Crear cuenta
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', 
        usuariosController.validarRegistro,
        usuariosController.crearUsuario);

    return router;
}