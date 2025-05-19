const mongoose = require('mongoose');
const conectarDB = require('./config/db');
const express = require('express');
const { engine } = require('express-handlebars'); 
const path = require('path');
const router = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const app = express();

require('dotenv').config({ path: 'variables.env'});
 
// habilitar BodyParser
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));

// Configurar el motor de plantillas
app.engine('handlebars', 
    engine({ 
        defaultLayout: 'layout' , 
        helpers: require('./helpers/handlebars')
    })
);

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
 
// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DATA_BASE,
        collectionName: 'sessions'
    }),
}));
 
// Usar el router
app.use('/', router());
 
// Iniciar el servidor
app.listen(process.env.PUERTO)

// Conectar a la base de datos
conectarDB()