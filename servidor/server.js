const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const { spawn } = require('child_process');
const multer = require('multer');
const fs = require('fs');

const app = express();

// Configuración de CORS y bodyParser
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../public')));

// Configuración para payloads grandes (50 MB)
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

const SECRET_KEY = "clave_secreta";

// Configuración de la carpeta para guardar las imágenes de perfil
const perfilDir = path.join(__dirname, 'public', 'perfil');
if (!fs.existsSync(perfilDir)) {
    fs.mkdirSync(perfilDir, { recursive: true });
    console.log(`Carpeta creada: ${perfilDir}`);
}

// Configuración de multer para subir archivos a la carpeta 'perfil'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, perfilDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now();
        // Aquí se utiliza req.body.email, asegúrate de que en el FormData se envíe con la clave 'email'
        cb(null, req.body.email + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });

// Ruta para registrar nuevos usuarios
app.post('/register', async (req, res) => {
    const { nombre, email, contraseña } = req.body;
    if (!nombre || !email || !contraseña) {
        return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    db.query(
        'INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)',
        [nombre, email, hashedPassword],
        (err, result) => {
            if (err) return res.status(500).json({ mensaje: "Error al registrar" });
            res.status(201).json({ mensaje: "Usuario registrado exitosamente" });
        }
    );
});

// Ruta para iniciar sesión de usuarios
app.post('/login', (req, res) => {
    const { email, contraseña } = req.body;
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
        }
        const usuario = results[0];
        const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!contraseñaValida) {
            return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
        }
        const token = jwt.sign({ id: usuario.id, email: usuario.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ mensaje: "Inicio de sesión exitoso", token });
    });
});

// Ruta para la conversión de texto a voz
app.post("/convert", (req, res) => {
    const { texto } = req.body;
    if (!texto || texto.trim() === "") {
        return res.status(400).json({ mensaje: "Texto vacío" });
    }

    const timestamp = Date.now();
    const nombreArchivo = `audio_${timestamp}`;
    const rutaMp3 = `public/Audios/${nombreArchivo}.mp3`;

    // Ruta al proyecto Rust donde se encuentra Cargo.toml
    const rustProjectDir = path.join(__dirname, '../rust');

    // Ejecutamos el comando cargo
    const rustProcess = spawn('cargo', ['run', '--release', '--', texto, nombreArchivo], {
        cwd: rustProjectDir,
        env: {
            ...process.env,
            PATH: `/home/josue-ortiz/.cargo/bin:${process.env.PATH}`,
        }
    });

    // Manejamos la salida del proceso Rust
    rustProcess.on('close', (code) => {
        if (code === 0) {
            res.json({ url: `/Audios/${nombreArchivo}.mp3` });
        } else {
            console.error(`Error de Rust: Código de salida ${code}`);
            if (!res.headersSent) {
                res.status(500).json({ mensaje: "Error en la conversión de texto a voz." });
            }
        }
    });

    // Manejo de errores en el proceso Rust
    rustProcess.on('error', (err) => {
        console.error('Error al ejecutar el proceso Rust:', err);
        if (!res.headersSent) {
            res.status(500).json({ mensaje: "Error al ejecutar el proceso Rust" });
        }
    });
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Ruta para obtener los audios generados
app.use('/Audios', express.static(path.join(__dirname, 'public/Audios')));

// Ruta para guardar el pago
app.post('/guardar-pago', (req, res) => {
    const { nombre_tarjeta, numero_tarjeta, fecha_vencimiento, cvv, metodo_pago, id_paquete, id_usuario } = req.body;

    if (!nombre_tarjeta || !numero_tarjeta || !fecha_vencimiento || !cvv || !metodo_pago || !id_paquete || !id_usuario) {
        return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    const queryPago = 'INSERT INTO pagos (nombre_tarjeta, numero_tarjeta, fecha_vencimiento, cvv, metodo_pago) VALUES (?, ?, ?, ?, ?)';
    db.query(queryPago, [nombre_tarjeta, numero_tarjeta, fecha_vencimiento, cvv, metodo_pago], (err, result) => {
        if (err) {
            console.error("Error al guardar pago:", err);
            return res.status(500).json({ mensaje: "Hubo un problema al guardar los datos del pago" });
        }

        const id_pago = result.insertId;
        const queryPagoPaquete = 'INSERT INTO pagos_paquete (id_pago, id_paquete, id_usuario) VALUES (?, ?, ?)';
        db.query(queryPagoPaquete, [id_pago, id_paquete, id_usuario], (err, result) => {
            if (err) {
                console.error("Error al guardar relación con paquete:", err);
                return res.status(500).json({ mensaje: "Hubo un problema al guardar los datos del paquete" });
            }

            const queryPaquete = 'SELECT nombre FROM paquetes WHERE id = ?';
            db.query(queryPaquete, [id_paquete], (err, result) => {
                if (err || result.length === 0) {
                    return res.status(500).json({ mensaje: "No se pudo obtener el nombre del paquete" });
                }
                const nombrePaquete = result[0].nombre;

                res.status(200).json({ 
                    mensaje: "Pago guardado exitosamente",
                    paquete: nombrePaquete
                });
            });
        });
    });
});

// Ruta para actualizar el perfil (cambio de contraseña y foto de perfil)
app.post('/actualizar-perfil', upload.single('foto_perfil'), async (req, res) => {
    console.log("Datos recibidos en req.body:", req.body);
    console.log("Archivo recibido:", req.file);

    const { email, nueva_contrasena } = req.body;   // Clave actualizada sin ñ
    const nuevaFoto = req.file ? `/perfil/${req.file.filename}` : null;

    if (!email || !nueva_contrasena) {
        return res.status(400).json({ mensaje: "Faltan datos" });
    }

    try {
        const hashedPassword = await bcrypt.hash(nueva_contrasena, 10);

        let query = 'UPDATE usuarios SET contraseña = ?';
        const params = [hashedPassword];

        if (nuevaFoto) {
            query += ', foto_perfil = ?';
            params.push(nuevaFoto);
        }

        query += ' WHERE email = ?';
        params.push(email);

        db.query(query, params, (err, result) => {
            if (err) {
                console.error('Error al actualizar el perfil:', err);
                return res.status(500).json({ mensaje: "Error al actualizar" });
            }
            res.status(200).json({ mensaje: "Perfil actualizado correctamente" });
        });
    } catch (error) {
        console.error("Error al encriptar la contraseña:", error);
        res.status(500).json({ mensaje: "Error interno" });
    }
});


// Inicia el servidor
const PORT = 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}
     o en tu IP: http://192.168.0.9:${PORT}`);
});
