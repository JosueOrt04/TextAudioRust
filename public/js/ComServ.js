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

        // Asegura que el audio no se reproduzca automáticamente
        audioPlayer.pause(); // Esto evitará la reproducción automática si ya está cargado
        audioPlayer.src = audioUrl; // Asigna la URL del audio

        // Muestra la interfaz de audio (pero no reproduce automáticamente)
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
    const maxTextLength = 5000; 
    
    try {
        // Dividir el texto en partes si es muy largo
        let chunks = [];
        while (text.length > 0) {
            chunks.push(text.substring(0, maxTextLength));
            text = text.substring(maxTextLength);
        }

        // divide las partes y genera el audio para cada una
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

            //// Crear y reproducir el audio
            //let audio = new Audio(audioUrl);
            //audio.play();

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




