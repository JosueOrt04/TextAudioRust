
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


