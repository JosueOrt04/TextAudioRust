function mostrarImagen(event) {
    const imagen = document.getElementById('profileImage');
    const archivo = event.target.files[0];
    const formData = new FormData();
    formData.append('foto_perfil', archivo);
    formData.append('id', usuarioId); // Reemplaza con el ID real del usuario

    fetch('http://localhost:3000/subir-foto', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.rutaFoto) {
            imagen.src = `http://localhost:3000${data.rutaFoto}`;
        }
    })
    .catch(error => console.error('Error al subir imagen:', error));
}


document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const id = usuarioId; // Reemplaza con el ID real del usuario
    const contraseñaActual = prompt("Introduce tu contraseña actual:");
    const nuevaContrasena = document.getElementById('password').value;

    fetch('http://localhost:3000/actualizar-contrasena', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, contraseñaActual, nuevaContrasena })
    })
    .then(response => response.json())
    .then(data => alert(data.mensaje))
    .catch(error => console.error('Error al actualizar contraseña:', error));
});
