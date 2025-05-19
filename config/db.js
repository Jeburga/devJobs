const mongoose = require('mongoose');
require('dotenv').config({path: 'variables.env'});

const conectarDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/devjobs', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // 5 segundos de espera
        });
        console.log('✅ MongoDB conectado');
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        process.exit(1); // Detiene la aplicación si hay error
    }
};

module.exports = conectarDB;

// const mongoose = require('mongoose');
// require('dotenv').config({path: 'variables.env'});

// const conectarDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI);
//         console.log('MongoDB conectado correctamente');
//     } catch (error) {
//         console.error('Error el conectar MongoDB: ', error);
//         process.exit(1);
//     }
// };
    
// module.exports = conectarDB
// require('../models/Vacantes');