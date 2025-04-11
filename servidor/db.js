const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Cambia esto por el usuario que creaste
    password: 'tuclave',  // Cambia esto por la contraseña que asignaste
    database: 'imagenjosman'
});

connection.connect(err => {
    if (err) {
        console.error('Error de conexión a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

module.exports = connection;
