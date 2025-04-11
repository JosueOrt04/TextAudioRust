document.getElementById("generate-btn").addEventListener("click", async () => {
    let text = document.getElementById("text-input").value;
    let audioContainer = document.getElementById("audio-container");
    let audioPlayer = document.getElementById("audio-player");
    let downloadBtn = document.getElementById("download-btn");
    let penguinAnimation = document.getElementById("penguin-animation");

    // Verifica que el texto no esté vacío
    if (!text.trim()) {
        alert("Por favor, introduce un texto.");
        return;
    }

    // Muestra la animación del pingüino y oculta la interfaz de audio
    penguinAnimation.style.display = "block";
    audioContainer.style.display = "none";

    try {
        let response = await fetch("http://localhost:3000/convert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texto: text })
        });

        if (!response.ok) {
            throw new Error("Error al generar el audio.");
        }

        let data = await response.json();
        let audioUrl = data.url;

        // Oculta la animación del pingüino
        penguinAnimation.style.display = "none";

        // Muestra la interfaz de audio (pero no reproduce automáticamente)
        audioPlayer.src = audioUrl;
        downloadBtn.href = audioUrl;
        audioContainer.style.display = "block";

    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un problema al generar el audio.");
        penguinAnimation.style.display = "none";
    }
});

// Función para borrar el texto
document.getElementById("clear-text").addEventListener("click", () => {
    document.getElementById("text-input").value = "";
});


// Obtener el elemento de texto y el contador
const textInput = document.getElementById("text-input");
const charCountElement = document.getElementById("char-count");
const maxChars = 4500;  // Limite de caracteres

// Actualizar contador de caracteres en tiempo real
textInput.addEventListener("input", updateCharCount);

function updateCharCount() {
    const text = textInput.value.trim();

    // Contamos las letras sin contar los espacios
    const charCount = text.replace(/\s+/g, '').length;  // Contamos solo las letras

    // Limitar a 4500 caracteres
    if (charCount > maxChars) {
        textInput.value = text.slice(0, maxChars);  // Recortar el texto al límite de 4500 caracteres
    }

    // Mostrar el contador de caracteres
    const remainingChars = maxChars - charCount;
    charCountElement.textContent = `${charCount} / ${maxChars} (Restantes: ${remainingChars})`;
}

// Lógica para generar el audio
document.getElementById("generate-btn").addEventListener("click", async () => {
    let text = textInput.value;

    // Verifica que el texto no esté vacío
    if (!text.trim()) {
        alert("Por favor, introduce un texto.");
        return;
    }

    // Si el texto es muy largo, podemos dividirlo en partes más pequeñas.
    const maxTextLength = 1000000000; // Puedes ajustar este valor si es necesario.
    
    try {
        // Dividir el texto en partes si es muy largo
        let chunks = [];
        while (text.length > 0) {
            chunks.push(text.substring(0, maxTextLength));
            text = text.substring(maxTextLength);
        }

        // Itera sobre las partes y genera el audio para cada una
        for (let i = 0; i < chunks.length; i++) {
            let currentText = chunks[i];
            // Realiza una solicitud POST al servidor para convertir el texto
            let response = await fetch("http://localhost:3000/convert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texto: currentText })
            });

            if (!response.ok) {
                throw new Error("Error al generar el audio.");
            }

            let data = await response.json();
            let audioUrl = data.url; // URL del archivo generado por el servidor

            // Crear y reproducir el audio
            let audio = new Audio(audioUrl);
            audio.play();

            // Mostrar el botón de descarga
            let downloadBtn = document.getElementById("download-btn");
            downloadBtn.href = audioUrl;
            downloadBtn.style.display = "inline-block";

            // Pausar entre partes para evitar la sobrecarga del servidor
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo entre partes
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un problema al generar el audio.");
    }
});

// Función para borrar el texto
document.getElementById("clear-text").addEventListener("click", () => {
    textInput.value = "";
    charCountElement.textContent = "0 / 4500";
});





<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Texto a Voz</title>
    <link rel="stylesheet" href="css/TEXTO.css">
</head>
<body>
    <header>
        <div class="logo">
            <img src="img/micro.jpg" alt="MiLogo">
        </div>
        <nav>
            <ul>
                <li><a href="pta2.html">Paquetes</a></li>
                <li><a href="#">Historial</a></li>
                <li><a href="perfil.html">Perfil</a></li>
            </ul>
        </nav>
    </header>
    
    <section class="hero">
        <h1>Gratis <span class="highlight">texto a voz</span></h1>
        <p>Josman es una herramienta gratuita de texto a voz (TTS) en línea...</p>
        <div class="cta-buttons">
            <button class="primary-btn">Prueba TTS</button>
            <button class="secondary-btn" onclick="mostrarModal()">Más información</button>
        </div>
    </section>
    
    <section class="tts-container">
        <div class="tabs">
            <button id="textoVozBtn" class="active">Texto a voz</button>
            <button id="archivoVozBtn">Archivo a voz</button>
        </div>

        <div class="text-area-container" id="textoVoz">
            <textarea id="text-input" placeholder="Ingresa tu texto aquí..." rows="10"></textarea>

            <div class="controls">
                <span id="char-count">0 / 4500</span>
                <button id="clear-text" class="btn-morado">Borrar texto</button>
            </div>
        </div>

        <div id="drop-area"  class="hidden">
            <p>Arrastra y suelta tu archivo aquí o haz clic para subirlo</p>
            <input type="file" id="file-input" accept=".txt, .pdf, .docx">
        </div>
        
        <!-- Botón para generar el audio -->
        <button id="generate-btn" class="btn-morado" onclick="generarAudio()">Generar</button>
        
        <!-- Animación de pingüino mientras se genera el audio -->
        <div id="penguin-animation" style="display: none;">
            <img src="img/pingi.gif" alt="Generando...">
            <p>Generando audio...</p>
        </div>

        <!-- Contenedor de audio y descarga -->
        <div id="audio-container" style="display: none;">
            <audio id="audio-player" controls></audio>
            <a id="download-btn" href="#" download>Descargar Audio</a>
        </div>
    </section>
    
    <section class="features">
        <h2>¿Cuáles son las características de Josman?</h2>
        <div class="feature-list">
            <div class="feature">
                <span class="icon">🎙️</span>
                <h3>Voz AI real</h3>
                <p>Genera sonidos extremadamente cercanos a la calidad humana.</p>
            </div>
            <div class="feature">
                <span class="icon">🎧</span>
                <h3>Convierte fácilmente texto a audio</h3>
                <p>Escribe o copia texto y conviértelo en voz.</p>
            </div>
        </div>
    </section>

    <!-- MODAL PARA "MÁS INFORMACIÓN" -->
    <div id="info-modal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="cerrarModal()">&times;</span>
            <h2>Sobre Josman</h2>
            <p>Josman es una plataforma que te permite convertir texto en audio de manera rápida y sencilla, con calidad de voz humana.</p>
        </div>
    </div>

    <!-- Fondo oscuro para la animación -->
    <div id="overlay"></div>

    <!-- Cuadro emergente con la información del archivo -->
    <div id="file-preview">
        <h3>Archivo Subido</h3>
        <p id="file-name">Nombre: Ninguno</p>
        <div id="file-content" style="max-height: 200px; overflow-y: auto; text-align: left;"></div>
        <button onclick="cerrarPreview()">Cerrar</button>
    </div>
    
    <script src="js/ComServ.js"></script>
    <script src="js/pdf.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js"></script>

    <script>
        function generarAudio() {
            const textInput = document.getElementById("text-input").value;

            if (!textInput.trim()) {
                alert("Por favor ingresa un texto.");
                return;
            }

            // Mostrar la animación del pingüino
            document.getElementById("penguin-animation").style.display = "block";
            document.getElementById("generate-btn").disabled = true;  // Deshabilitar el botón mientras se genera

            // Enviar la solicitud al servidor para generar el audio
            fetch('http://localhost:3000/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ texto: textInput })
            })
            .then(response => response.json())
            .then(data => {
                // Ocultar la animación y mostrar el reproductor
                document.getElementById("penguin-animation").style.display = "none";
                document.getElementById("audio-container").style.display = "block";

                // Mostrar el enlace de descarga
                const downloadBtn = document.getElementById("download-btn");
                downloadBtn.href = data.url;
                downloadBtn.style.display = "inline-block";

                // Habilitar el botón de generar audio nuevamente
                document.getElementById("generate-btn").disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Hubo un error al generar el audio.');
                document.getElementById("generate-btn").disabled = false;  // Rehabilitar el botón
                document.getElementById("penguin-animation").style.display = "none";  // Ocultar animación
            });
        }
    </script>
</body>
</html>
