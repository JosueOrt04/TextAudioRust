const $btnSignIn = document.querySelector('.sign-in-btn'),
      $btnSignUp = document.querySelector('.sign-up-btn'),
      $signUp = document.querySelector('.sign-up'),
      $signIn = document.querySelector('.sign-in');

document.addEventListener('click', e => {
    if (e.target === $btnSignIn || e.target === $btnSignUp) {
        $signIn.classList.toggle('active');
        $signUp.classList.toggle('active');
    }
});

/* Registro y inicio de sesión */

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('.formulario input[value="Registrarse"]').addEventListener('click', async () => {
        const nombre = document.querySelector('input[placeholder="Nombre"]').value;
        const email = document.querySelector('input[placeholder="Email"]').value;
        const contraseña = document.querySelector('input[placeholder="Contraseña"]').value;

        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, contraseña })
        });

        const data = await response.json();
        alert(data.mensaje);

        if (data.mensaje === 'Registro exitoso') {
            // Después del registro exitoso, mostramos el mensaje de inicio de sesión
            alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
            // Cambiar a la sección de inicio de sesión
            $signUp.classList.remove('active');
            $signIn.classList.add('active');
        }
    });

    document.querySelector('.formulario input[value="Iniciar Sesion"]').addEventListener('click', async () => {
        const email = document.querySelector('.sign-in input[placeholder="Email"]').value;
        const contraseña = document.querySelector('.sign-in input[placeholder="Contraseña"]').value;

        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, contraseña })
        });

        const data = await response.json();
        alert(data.mensaje);

        if (data.token) {
            localStorage.setItem("token", data.token);
            // Redirigir a TEXTO.HTML después de iniciar sesión
            window.location.href = "../TEXTO.html"; // Utiliza "../" para salir de la carpeta js
        }
    });
});
