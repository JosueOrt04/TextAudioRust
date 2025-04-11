document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("file-input");
    const uploadBtn = document.getElementById("upload-btn");
    const textInput = document.getElementById("text-input");

    uploadBtn.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            if (file.type === "text/plain") {
                reader.onload = (e) => {
                    textInput.value = e.target.result;
                };
                reader.readAsText(file);
            } else if (file.type === "application/pdf") {
                extractTextFromPDF(file);
            } else {
                alert("Formato no soportado. Usa archivos .txt o .pdf.");
            }
        }
    });

    function extractTextFromPDF(file) {
        const reader = new FileReader();
        reader.onload = async function (event) {
            const pdfData = new Uint8Array(event.target.result);
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            let extractedText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                extractedText += textContent.items.map(item => item.str).join(" ") + "\n";
            }

            textInput.value = extractedText;
        };
        reader.readAsArrayBuffer(file);
    }
});

// MOSTRAR MODAL
function mostrarModal() {
    document.getElementById("info-modal").style.display = "flex";
}

// CERRAR MODAL
function cerrarModal() {
    document.getElementById("info-modal").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    const archivoVozBtn = document.getElementById("archivoVozBtn");
    const textoVozBtn = document.getElementById("textoVozBtn");
    const dropArea = document.getElementById("drop-area");

    archivoVozBtn.addEventListener("click", () => {
        archivoVozBtn.classList.add("active-tab");
        textoVozBtn.classList.remove("active-tab");
        dropArea.style.display = "block"; // Mostrar tabla de subir archivos
    });

    textoVozBtn.addEventListener("click", () => {
        archivoVozBtn.classList.remove("active-tab");
        textoVozBtn.classList.add("active-tab");
        dropArea.style.display = "none"; // Ocultar tabla de subir archivos
    });

    // Ocultar la tabla al recargar la página
    dropArea.style.display = "none";
});



document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("file-input");
    const dropArea = document.getElementById("drop-area");
    const filePreview = document.getElementById("file-preview");
    const fileNameElement = document.getElementById("file-name");
    const fileContentElement = document.getElementById("file-content");
    const overlay = document.getElementById("overlay");
    const textInput = document.getElementById("text-input");

    dropArea.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropArea.style.backgroundColor = "#e0e0ff";
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.style.backgroundColor = "white";
    });

    dropArea.addEventListener("drop", (event) => {
        event.preventDefault();
        dropArea.style.backgroundColor = "white";
        const file = event.dataTransfer.files[0];
        procesarArchivo(file);
    });

    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        procesarArchivo(file);
    });

    function procesarArchivo(file) {
        if (!file) return;

        fileNameElement.textContent = "Nombre: " + file.name;
        fileContentElement.innerHTML = "<p>Cargando contenido...</p>";

        const reader = new FileReader();

        if (file.type === "text/plain") {
            reader.onload = (e) => {
                const text = e.target.result;
                fileContentElement.innerText = text || "No se pudo leer el archivo.";
                textInput.value += "\n" + text;
            };
            reader.readAsText(file);
        } else if (file.type === "application/pdf") {
            reader.onload = async function (event) {
                try {
                    const pdfData = new Uint8Array(event.target.result);
                    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
                    let extractedText = "";

                    for (let i = 1; i <= Math.min(10, pdf.numPages); i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        extractedText += textContent.items.map(item => item.str).join(" ") + "\n";
                    }

                    fileContentElement.innerText = extractedText || "No se pudo extraer texto del PDF.";
                    textInput.value += "\n" + extractedText;
                } catch (error) {
                    fileContentElement.innerHTML = "<p>Error al procesar el PDF.</p>";
                }
            };
            reader.readAsArrayBuffer(file);
        } else if (file.name.endsWith(".docx")) {
            reader.onload = function (event) {
                const arrayBuffer = event.target.result;
                mammoth.convertToText({ arrayBuffer: arrayBuffer })
                    .then(result => {
                        const text = result.value;
                        fileContentElement.innerText = text || "No se pudo leer el archivo Word.";
                        textInput.value += "\n" + text;
                    })
                    .catch(err => {
                        fileContentElement.innerHTML = "<p>Error al procesar el archivo Word.</p>";
                    });
            };
            reader.readAsArrayBuffer(file);
        } else {
            fileContentElement.innerHTML = "<p>Formato no soportado. Usa archivos .txt, .pdf o .docx.</p>";
        }

        mostrarPreview();
    }

    function mostrarPreview() {
        filePreview.style.display = "block";
        overlay.style.display = "block";
    }

    window.cerrarPreview = () => {
        filePreview.style.display = "none";
        overlay.style.display = "none";
    };
});
