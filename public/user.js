// Importamos las dependencias necesarias
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Definimos la cantidad de "salt rounds" para el cifrado de contraseñas
const saltRounds = 10;

// Creamos un esquema de usuario utilizando Mongoose
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // El nombre de usuario es obligatorio y único
    password: { type: String, required: true } // La contraseña es obligatoria
});

// Middleware para el preprocesamiento de la contraseña antes de guardarla en la base de datos
UserSchema.pre('save', function (next) {
    // Verificamos si la contraseña es nueva o si se ha modificado
    if (this.isNew || this.isModified('password')) {
        const document = this;

        // Generamos un hash de la contraseña usando bcrypt
        bcrypt.hash(document.password, saltRounds, (err, hashedPassword) => {
            if (err) {
                next(err);
            } else {
                // Reemplazamos la contraseña original con el hash generado
                document.password = hashedPassword;
                next();
            }
        });
    } else {
        next();
    }
});

// Método personalizado para verificar si una contraseña es correcta
UserSchema.methods.isCorrectPassword = function (password, callback) {
    // Comparamos la contraseña proporcionada con la contraseña almacenada en la base de datos
    bcrypt.compare(password, this.password, function (err, same) {
        if (err) {
            callback(err);
        } else {
            callback(err, same); // same es `true` si la contraseña es correcta, `false` si no lo es
        }
    });
};

// Exportamos el modelo de usuario basado en el esquema definido
module.exports = mongoose.model('user', UserSchema);
