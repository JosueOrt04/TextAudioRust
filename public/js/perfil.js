document.querySelector("form").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const nuevaContrasena = document.getElementById("password").value;  // Nota: ya no tiene ñ
    const imagenInput = document.getElementById("fileInput");

    // Asegúrate de que los valores no estén vacíos
    if (!email || !nuevaContrasena) {
        alert("El correo y la contraseña son obligatorios.");
        return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("nueva_contrasena", nuevaContrasena);  // Clave sin ñ

    // Si hay una foto seleccionada, añadirla a los datos del formulario
    if (imagenInput.files.length > 0) {
        formData.append("foto_perfil", imagenInput.files[0]);
    }

    enviarDatos(formData);
});

async function enviarDatos(formData) {
    try {
        const res = await fetch("/actualizar-perfil", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            alert("Perfil actualizado exitosamente");
            window.location.href = "index.html";
        } else {
            alert(data.mensaje || "Error al actualizar perfil");
        }
    } catch (err) {
        console.error("Error en la actualización:", err);
        alert("Hubo un problema en el servidor.");
    }
}

function mostrarImagen(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("profileImage").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function cerrarSesion() {
    alert("Sesión cerrada");
    window.location.href = "index.html";
}
