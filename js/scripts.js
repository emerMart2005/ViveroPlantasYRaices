document.addEventListener("DOMContentLoaded", function () {
  // 1. Funcionalidad de búsqueda
  const btnMostrarBusqueda = document.getElementById("btnMostrarBusqueda");
  const barraBusqueda = document.getElementById("barraBusqueda");

  if (btnMostrarBusqueda && barraBusqueda) {
    btnMostrarBusqueda.addEventListener("click", function () {
      barraBusqueda.classList.toggle("d-none");
      if (!barraBusqueda.classList.contains("d-none")) {
        barraBusqueda.querySelector("input")?.focus();
      }
    });

    document.addEventListener("click", function (event) {
      const clickDentroBusqueda = barraBusqueda.contains(event.target);
      const clickEnBoton = btnMostrarBusqueda.contains(event.target);

      if (!clickDentroBusqueda && !clickEnBoton) {
        barraBusqueda.classList.add("d-none");
      }
    });
  }

  // 2. Carrito de compras
  const Carrito = {
    items: JSON.parse(localStorage.getItem("carrito")) || [],

    agregar(producto) {
      const existente = this.items.find((item) => item.id === producto.id);
      if (existente) {
        existente.cantidad++;
      } else {
        this.items.push({ ...producto, cantidad: 1 });
      }
      this.guardar();
    },

    eliminar(id) {
      this.items = this.items.filter((item) => item.id !== id);
      this.guardar();
    },

    actualizar(id, cantidad) {
      const item = this.items.find((item) => item.id === id);
      if (item) {
        item.cantidad = cantidad > 0 ? cantidad : 1;
        this.guardar();
      }
    },

    vaciar() {
      if (confirm("¿Estás seguro de vaciar el carrito?")) {
        this.items = [];
        this.guardar();
      }
    },

    calcularTotal() {
      return this.items.reduce(
        (total, item) => total + item.precio * item.cantidad,
        0
      );
    },

    contarItems() {
      return this.items.reduce((total, item) => total + item.cantidad, 0);
    },

    guardar() {
      localStorage.setItem("carrito", JSON.stringify(this.items));
      this.actualizarUI();
    },

    actualizarUI() {
      const contador = document.getElementById("contador-carrito");
      if (contador) {
        contador.textContent = this.contarItems();
        contador.style.display = this.items.length ? "block" : "none";
      }

      const listaCarrito = document.getElementById("listaCarrito");
      if (listaCarrito) {
        listaCarrito.innerHTML = this.items
          .map(
            (item) => `
              <li class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="d-flex align-items-center">
                    <img src="${
                      item.imagen
                    }" width="50" height="50" class="me-3 rounded object-fit-cover">
                    <div>
                      <div class="fw-bold">${item.nombre}</div>
                      <div class="d-flex align-items-center mt-1">
                        <button class="btn btn-sm btn-outline-secondary py-0 px-2" onclick="Carrito.actualizar(${
                          item.id
                        }, ${item.cantidad - 1})">-</button>
                        <span class="mx-2">${item.cantidad}</span>
                        <button class="btn btn-sm btn-outline-secondary py-0 px-2" onclick="Carrito.actualizar(${
                          item.id
                        }, ${item.cantidad + 1})">+</button>
                      </div>
                    </div>
                  </div>
                  <div class="text-end">
                    <div class="fw-bold">$${(
                      item.precio * item.cantidad
                    ).toLocaleString("es-CL")}</div>
                    <button class="btn btn-sm btn-danger mt-1" onclick="Carrito.eliminar(${
                      item.id
                    })">
                      <i class="bi bi-trash"></i> Eliminar
                    </button>
                  </div>
                </div>
              </li>
            `
          )
          .join("");
      }

      const totalElement = document.getElementById("totalCarrito");
      if (totalElement) {
        totalElement.textContent = `$${this.calcularTotal().toLocaleString(
          "es-CL"
        )}`;
      }
    },
  };

  // 3. Funciones auxiliares
  function mostrarFeedback(boton) {
    const originalText = boton.textContent;
    boton.textContent = "✓ Agregado";
    boton.classList.add("agregado");

    setTimeout(() => {
      boton.textContent = originalText;
      boton.classList.remove("agregado");
    }, 2000);
  }

  function procesarPago() {
    if (Carrito.items.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    alert(
      `Compra realizada por $${Carrito.calcularTotal().toLocaleString(
        "es-CL"
      )}\n¡Gracias por tu compra!`
    );
    Carrito.vaciar();
    const offcanvas = bootstrap.Offcanvas.getInstance(
      document.getElementById("offcanvasCar")
    );
    if (offcanvas) offcanvas.hide();
  }

  // 4. Manejador de eventos para productos
  function manejarAgregarProducto(event) {
    // Botones "Agregar al carrito"
    if (
      event.target.classList.contains("product-button") ||
      event.target.closest(".product-button")
    ) {
      const button = event.target.classList.contains("product-button")
        ? event.target
        : event.target.closest(".product-button");
      const card = button.closest(".card");

      // Extraer precio (elimina símbolos no numéricos pero conserva decimales)
      const precioTexto = card.querySelector(".product-price").textContent;
      const precioNumerico = parseFloat(precioTexto.replace(/[^0-9.-]/g, ""));

      const producto = {
        id: parseInt(card.dataset.id),
        nombre: card.querySelector(".product-title").textContent,
        precio: precioNumerico,
        imagen: card.querySelector(".product-img").src,
      };

      Carrito.agregar(producto);
      mostrarFeedback(button);
    }

    // Botón "Proceder al pago"
    if (event.target.id === "btnPagar" || event.target.closest("#btnPagar")) {
      procesarPago();
    }
  }

  // 5. Inicialización
  Carrito.actualizarUI();
  document.addEventListener("click", manejarAgregarProducto);

  // Hacer el carrito accesible globalmente
  window.Carrito = Carrito;
  window.procesarPago = procesarPago;
});
