// Función para animar los planes cuando se presionan
function animatePlan(plan) {
    plan.classList.add("clicked");
    setTimeout(() => {
        plan.classList.remove("clicked");
    }, 200);
}


