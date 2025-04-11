document.addEventListener("DOMContentLoaded", function() {
    const plans = document.querySelectorAll(".btn-select");
    const modal = document.getElementById("paymentModal");
    const closeModal = document.querySelector(".close");
    const successModal = document.getElementById("successMessage");

    // Asegurar que todo está oculto al cargar
    modal.style.display = "none";
    successModal.style.display = "none";

    plans.forEach(plan => {
        plan.addEventListener("click", function(event) {
            event.preventDefault();
            modal.style.display = "flex"; // Mostrar modal al hacer clic
        });
    });

    closeModal.addEventListener("click", function() {
        modal.style.display = "none"; // Cerrar modal al hacer clic en "X"
    });

    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            modal.style.display = "none"; // Cerrar modal si se hace clic afuera
        }
    });

    // Función para manejar el envío del formulario
    document.getElementById("paymentForm").addEventListener("submit", function(event) {
        event.preventDefault();

        // Obtener los valores del formulario
        const nombreTarjeta = document.getElementById("name").value;
        const numeroTarjeta = document.getElementById("cardNumber").value;
        const fechaVencimientoInput = document.getElementById("expiration").value;
        const fechaVencimiento = fechaVencimientoInput + "-01"; // ✅ Formato válido para MySQL
        const cvv = document.getElementById("cvv").value;
        const metodoPago = document.getElementById("paymentMethod").value;
        const idPaquete = 1;  // Deberías definir el ID del paquete seleccionado de alguna manera
        const idUsuario = 1;  // Aquí deberías obtener el ID del usuario actual de tu sesión



        

        // Crear un objeto con los datos del pago
        const paymentData = {
            nombre_tarjeta: nombreTarjeta,
            numero_tarjeta: numeroTarjeta,
            fecha_vencimiento: fechaVencimiento,
            cvv: cvv,
            metodo_pago: metodoPago,
            id_paquete: idPaquete,
            id_usuario: idUsuario

            
        };



        // Enviar los datos al servidor utilizando fetch
        fetch('/guardar-pago', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.mensaje === "Pago guardado exitosamente") {
                // Ocultar modal y mostrar mensaje de éxito
                modal.style.display = "none";
                successModal.style.display = "flex";

                // Cerrar automáticamente el mensaje después de 3 segundos
                setTimeout(() => {
                    successModal.style.display = "none";
                }, 3000);
            } else {
                alert('Hubo un error al procesar tu pago.');
            }
        })
        .catch(error => {
            console.error('Error al enviar los datos de pago:', error);
            alert('Hubo un error al procesar tu pago.');
        });
    });
});

// Función para cerrar el mensaje de éxito manualmente
function closeSuccessMessage() {
    document.getElementById("successMessage").style.display = "none";
}

// Mostrar logo de tarjeta automáticamente
document.getElementById("cardNumber").addEventListener("input", function() {
    const cardNumber = this.value;
    const cardLogo = document.getElementById("cardLogo");

    if (/^4/.test(cardNumber)) {
        cardLogo.src = "img/visa.png";
        cardLogo.style.display = "inline";
    } else if (/^5[1-5]/.test(cardNumber)) {
        cardLogo.src = "img/mastercard.png";
        cardLogo.style.display = "inline";
    } else {
        cardLogo.src = "";
        cardLogo.style.display = "none";
    }
});
