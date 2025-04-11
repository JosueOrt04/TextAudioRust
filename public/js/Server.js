async function speakText() {
    let text = document.getElementById("text-input").value;
    
    if (!text.trim()) {
        alert("Por favor, introduce un texto.");
        return;
    }

    try {
        let response = await fetch("http://localhost:5000/convert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texto: text })
        });

        if (!response.ok) {
            throw new Error("Error al generar el audio.");
        }

        let blob = await response.blob();
        let url = URL.createObjectURL(blob);

        // Crear y reproducir el audio
        let audio = new Audio(url);
        audio.play();

        // Agregar un botón de descarga
        let downloadBtn = document.getElementById("download-btn");
        downloadBtn.href = url;
        downloadBtn.style.display = "inline-block";
    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un problema al generar el audio.");
    }
}

// Cargar voces en el select
window.onload = function () {
    let voicesDropdown = document.getElementById("voice-select");
    let voices = window.speechSynthesis.getVoices();

    voices.forEach(voice => {
        let option = document.createElement("option");
        option.value = voice.name;
        option.textContent = voice.name;
        voicesDropdown.appendChild(option);
    });

    window.speechSynthesis.onvoiceschanged = function () {
        voicesDropdown.innerHTML = "";
        voices = window.speechSynthesis.getVoices();
        voices.forEach(voice => {
            let option = document.createElement("option");
            option.value = voice.name;
            option.textContent = voice.name;
            voicesDropdown.appendChild(option);
        });
    };
};
