document.addEventListener("DOMContentLoaded", function () {
  const btnMostrarBusqueda = document.getElementById("btnMostrarBusqueda");
  const barraBusqueda = document.getElementById("barraBusqueda");

  btnMostrarBusqueda.addEventListener("click", function () {
    barraBusqueda.classList.toggle("d-none");
    if (!barraBusqueda.classList.contains("d-none")) {
      barraBusqueda.querySelector("input").focus(); // Foco automático al input
    }
  });
});
