// Importar las dependencias necesarias
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

const bcrypt = require('bcrypt'); // Para el cifrado de contraseñas
const mongoose = require('mongoose'); // Para interactuar con MongoDB
const User = require('./public/user'); // Importar el modelo de usuario definido en otro archivo

// Configuración de middleware para manejar datos JSON y formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Configuración para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a la base de datos MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/login', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch((err) => console.log('Error al conectarse a MongoDB', err));

// Ruta para el registro de usuarios
app.post('/register', (req, res) => {
    const { name, password } = req.body;

    // Crear una nueva instancia de usuario con los datos proporcionados
    const newUser = new User({ name, password });

    // Guardar el usuario en la base de datos
    newUser.save()
        .then(() => {
            // Enviar una respuesta exitosa al cliente
            res.status(200).send('EL USUARIO SE REGISTRÓ CORRECTAMENTE');
        })
        .catch((err) => {
            // Enviar una respuesta de error al cliente en caso de fallo
            res.status(500).send('ERROR AL REGISTRAR USUARIO');
        });
});

// Ruta para la autenticación de usuarios
app.post('/authenticate', (req, res) => {
    const { name, password } = req.body;

    // Buscar un usuario en la base de datos por su nombre
    User.findOne({ name })
        .then(user => {
            if (!user) {
                // Si no se encuentra el usuario, enviar un mensaje de error
                res.status(500).send('EL USUARIO NO EXISTE');
            } else {
                // Si se encuentra el usuario, verificar la contraseña utilizando un método personalizado
                user.isCorrectPassword(password, (err, result) => {
                    if (err || !result) {
                        // Si hay un error o la contraseña es incorrecta, enviar un mensaje de error
                        res.status(500).send('DATOS INCORRECTOS');
                    } else {
                        // Si la contraseña es correcta, enviar un mensaje de éxito
                        res.status(200).send('USUARIO AUTENTICADO CORRECTAMENTE');
                    }
                });
            }
        })
        .catch(err => {
            // Enviar una respuesta de error al cliente en caso de fallo en la búsqueda
            console.error('Error al buscar el usuario:', err);
            res.status(500).send('ERROR AL AUTENTICAR AL USUARIO');
        });
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log(`Servidor en el puerto ${3000}`);
});

// Exportar la aplicación para su uso en otros módulos (si es necesario)
module.exports = app;

