const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');

const usuariosSchema = new mongoose.Schema({
    email:  {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    nombre: {
        type: String,
        required: 'Agrega tu nombre'
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    token: String,
    expira: Date
});

// Método para hashear los passwords
usuariosSchema.pre('save', async function(next){
    if (!this.isModified('password')){
        return next(); // detener la ejercución
    }
    // si no está hasheado
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
})

module.exports = mongoose.model('Usuarios', usuariosSchema);