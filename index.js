const express = require('express');
const { engine } = require('express-handlebars'); // Importar la función `engine` desde express-handlebars
const path = require('path');
const router = require('./routes');
 
const app = express();
 
// Configurar el motor de plantillas
app.engine('handlebars', engine({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
 
// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
 
// Usar el router
app.use('/', router());
 
// Iniciar el servidor
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});