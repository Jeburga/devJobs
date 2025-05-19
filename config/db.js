const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

console.log('DATA_BASE:', process.env.DATA_BASE);

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.DATA_BASE, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('MongoDB conectado');
    } catch (error) {
        console.error('Error de conexión:', error.message);
        process.exit(1);
    }
};

module.exports = conectarDB;