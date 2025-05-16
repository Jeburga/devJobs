const mongoose = require('mongoose');
require('dotenv').config({path: 'variables.env'});

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB conectado correctamente');
    } catch (error) {
        console.error('Error el conectar MongoDB: ', error);
        process.exit(1);
    }
};
    
module.exports = conectarDB
require('../models/Vacantes');