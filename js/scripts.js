document.addEventListener("DOMContentLoaded", function () {
  // 1. Funcionalidad de búsqueda (se mantiene igual)
  const btnMostrarBusqueda = document.getElementById("btnMostrarBusqueda");
  const barraBusqueda = document.getElementById("barraBusqueda");

  // Solo si existen ambos elementos continúo con la lógica
  if (btnMostrarBusqueda && barraBusqueda) {
    btnMostrarBusqueda.addEventListener("click", function () {
      // Alterno la visibilidad de la barra
      barraBusqueda.classList.toggle("d-none");

      // Si está visible, hago focus al input automáticamente
      if (!barraBusqueda.classList.contains("d-none")) {
        barraBusqueda.querySelector("input")?.focus();
      }
    });

    document.addEventListener("click", function (event) {
      const clickDentroBusqueda = barraBusqueda.contains(event.target);
      const clickEnBoton = btnMostrarBusqueda.contains(event.target);

      // Si el clic es fuera de la barra y del botón, oculto la barra
      if (!clickDentroBusqueda && !clickEnBoton) {
        barraBusqueda.classList.add("d-none");
      }
    });
  }

  // 2. Carrito de compras (con corrección para puntos de mil)
  const Carrito = {
    // Recupero el carrito desde localStorage, si no hay nada uso arreglo vacío
    items: JSON.parse(localStorage.getItem("carrito")) || [],

    // Función para convertir precios con formato a número
    parsePrecio: function (precioTexto) {
      // Elimino símbolos, letras y espacios, me quedo solo con números, puntos y comas
      let precioLimpio = precioTexto.replace(/[^\d.,]/g, "");

      // Si tiene punto y coma, interpreto como formato chileno (puntos de mil, coma decimal)
      if (
        precioLimpio.indexOf(".") !== -1 &&
        precioLimpio.indexOf(",") !== -1
      ) {
        precioLimpio = precioLimpio.replace(/\./g, "").replace(",", ".");
      }
      // Si solo tiene puntos, hay que decidir si son decimales o miles
      else if (precioLimpio.indexOf(".") !== -1) {
        // Si tiene más de un punto o el grupo después del punto es de 3 dígitos, asumo que es miles
        const partes = precioLimpio.split(".");
        if (
          partes.length > 2 ||
          (partes.length > 1 && partes[1].length === 3)
        ) {
          precioLimpio = precioLimpio.replace(/\./g, "");
        }
      }

      return parseFloat(precioLimpio.replace(",", ".")); // Convierto el string final a número decimal
    },

    agregar(producto) {
      // Si el producto ya existe, aumento la cantidad
      const existente = this.items.find((item) => item.id === producto.id);
      if (existente) {
        existente.cantidad++;
      } else {
        // Si no existe, lo agrego al carrito con cantidad 1
        this.items.push({ ...producto, cantidad: 1 });
      }
      this.guardar(); // Siempre guardo cambios en localStorage y actualizo UI
    },

    eliminar(id) {
      // Elimino el producto con ese id del carrito
      this.items = this.items.filter((item) => item.id !== id);
      this.guardar();
    },

    actualizar(id, cantidad) {
      // Actualizo la cantidad de un producto (mínimo 1)
      const item = this.items.find((item) => item.id === id);
      if (item) {
        item.cantidad = cantidad > 0 ? cantidad : 1;
        this.guardar();
      }
    },

    vaciar() {
      // Confirmo antes de vaciar el carrito completamente
      if (confirm("¿Estás seguro de vaciar el carrito?")) {
        this.items = [];
        this.guardar();
      }
    },

    calcularTotal() {
      // Calculo el total sumando precio * cantidad de cada producto
      return this.items.reduce(
        (total, item) => total + item.precio * item.cantidad,
        0
      );
    },

    contarItems() {
      // Sumo todas las cantidades para saber cuántos productos hay en total
      return this.items.reduce((total, item) => total + item.cantidad, 0);
    },

    guardar() {
      // Guardo el carrito actualizado en localStorage
      localStorage.setItem("carrito", JSON.stringify(this.items));
      this.actualizarUI(); // También actualizo la interfaz
    },

    actualizarUI() {
      // Actualizo el contador del carrito (ícono)
      const contador = document.getElementById("contador-carrito");
      if (contador) {
        contador.textContent = this.contarItems();
        contador.style.display = this.items.length ? "block" : "none";
      }

      const listaCarrito = document.getElementById("listaCarrito");
      if (listaCarrito) {
        // Recorro los items del carrito y genero el HTML para mostrarlos en la lista
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
          .join(""); // Uno todos los ítems en un solo string HTML
      }

      const totalElement = document.getElementById("totalCarrito");
      if (totalElement) {
        // Muestro el total del carrito con formato chileno
        totalElement.textContent = `$${this.calcularTotal().toLocaleString(
          "es-CL"
        )}`;
      }
    },
  };

  // 3. Funciones auxiliares
  function mostrarFeedback(boton) {
    // Cambio el texto y estilo del botón por unos segundos al agregar un producto
    const originalText = boton.textContent;
    boton.textContent = "✓ Agregado";
    boton.classList.add("agregado");

    setTimeout(() => {
      boton.textContent = originalText;
      boton.classList.remove("agregado");
    }, 2000);
  }

  function procesarPago() {
    // Si el carrito está vacío, no permito continuar
    if (Carrito.items.length === 0) {
      alert("El carrito está vacío");
      return;
    }
    // Mensaje de confirmación de compra
    alert(
      `Compra realizada por $${Carrito.calcularTotal().toLocaleString(
        "es-CL"
      )}\n¡Gracias por tu compra!`
    );
    // Limpio el carrito
    Carrito.vaciar();

    // Cierro el offcanvas del carrito si está abierto
    const offcanvas = bootstrap.Offcanvas.getInstance(
      document.getElementById("offcanvasCar")
    );
    if (offcanvas) offcanvas.hide();
  }

  // 4. Manejador de eventos para productos
  function manejarAgregarProducto(event) {
    // Si el clic fue en un botón "Agregar al carrito" o dentro de él
    if (
      event.target.classList.contains("product-button") ||
      event.target.closest(".product-button")
    ) {
      // Normalizo el botón (por si se hace clic en un hijo del botón)
      const button = event.target.classList.contains("product-button")
        ? event.target
        : event.target.closest(".product-button");

      // Busco la card asociada al producto
      const card = button.closest(".card");

      // Extraigo los datos del producto desde la card
      const producto = {
        id: parseInt(card.dataset.id),
        nombre: card.querySelector(".product-title").textContent,
        precio: Carrito.parsePrecio(
          card.querySelector(".product-price").textContent
        ),
        imagen: card.querySelector(".product-img").src,
      };

      // Agrego el producto al carrito y muestro feedback visual
      Carrito.agregar(producto);
      mostrarFeedback(button);
    }

    // Si se clickea el botón de "Proceder al pago"
    if (event.target.id === "btnPagar" || event.target.closest("#btnPagar")) {
      procesarPago();
    }
  }

  // 5. Inicialización
  Carrito.actualizarUI(); // Al cargar la página, actualizo el contador y el contenido del carrito
  document.addEventListener("click", manejarAgregarProducto); // Escucho clicks en toda la página para manejar botones

  // Hacer el carrito accesible globalmente
  window.Carrito = Carrito;
  window.procesarPago = procesarPago;
});
