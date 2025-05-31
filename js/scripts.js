document.addEventListener("DOMContentLoaded", function () {
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

  /// Código para carrusel personalizado #carouselPromo
  const track = document.querySelector("#carouselPromo .carousel-track");
  if (track) {
    const items = track.children;
    let isMoving = false;

    function getItemWidth() {
      return items[0].offsetWidth;
    }

    function moveNextPromo() {
      if (isMoving) return;
      isMoving = true;
      const width = getItemWidth();
      track.style.transition = "transform 0.5s ease-in-out";
      track.style.transform = `translateX(-${width}px)`;

      setTimeout(() => {
        track.appendChild(track.firstElementChild);
        track.style.transition = "none";
        track.style.transform = "translateX(0)";
        isMoving = false;
      }, 500);
    }

    function movePrevPromo() {
      if (isMoving) return;
      isMoving = true;
      const width = getItemWidth();
      track.insertBefore(track.lastElementChild, track.firstElementChild);
      track.style.transition = "none";
      track.style.transform = `translateX(-${width}px)`;

      requestAnimationFrame(() => {
        track.style.transition = "transform 0.5s ease-in-out";
        track.style.transform = "translateX(0)";
      });

      setTimeout(() => {
        isMoving = false;
      }, 500);
    }

    // Botones
    document
      .querySelector("#carouselPromo .next")
      .addEventListener("click", moveNextPromo);
    document
      .querySelector("#carouselPromo .prev")
      .addEventListener("click", movePrevPromo);

    // Auto-desplazamiento cada 4 segundos
    setInterval(() => {
      moveNextPromo();
    }, 4000);
  }

  // Código para el botón de búsqueda expandible
  // Solo se ejecuta si existe el botón y la barra de búsqueda
  const btnToggle = document.getElementById("btnToggleBusqueda");
  const barraBusqueda = document.getElementById("barraBusquedaExpandida");
  const inputBusqueda = barraBusqueda.querySelector("input");

  btnToggle.addEventListener("click", () => {
    barraBusqueda.classList.toggle("d-none");

    // Esperar a que se renderice y enfocar
    if (!barraBusqueda.classList.contains("d-none")) {
      setTimeout(() => inputBusqueda.focus(), 100);
    }
  });

  // Inicializar el mapa si existe el div con ID 'miMapa'
  const API_KEY = "5b3ce3597851110001cf6248e85ceea8dc314a908625c56c1eb0cba2";

  function inicializarMapa() {
    const divMapa = document.getElementById("miMapa");
    if (!divMapa) return;

    const destino = [8.945412013898874, -75.43939539300182]; // Coordenadas del vivero
    const map = L.map("miMapa").setView(destino, 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const markerDestino = L.marker(destino).addTo(map);
    markerDestino
      .bindPopup("<b>Plantas y Raíces</b><br>Tu tienda de jardinería")
      .openPopup();

    // Intentar obtener ubicación del usuario
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const origen = [position.coords.latitude, position.coords.longitude];

          const markerUsuario = L.marker(origen, { color: "blue" }).addTo(map);
          markerUsuario.bindPopup("Estás aquí").openPopup();

          // Centrar el mapa entre los dos puntos
          const bounds = L.latLngBounds([origen, destino]);
          map.fitBounds(bounds, { padding: [50, 50] });

          // Trazo de ruta
          await trazarRuta(map, origen, destino);
        },
        (error) => {
          console.warn("Ubicación no permitida o fallida:", error.message);
          alert("No se pudo obtener tu ubicación. Solo se mostrará el vivero.");
        }
      );
    } else {
      alert("Tu navegador no soporta geolocalización.");
    }
  }

  // Función que llama a OpenRouteService y dibuja la ruta
  async function trazarRuta(map, origen, destino) {
    try {
      const response = await fetch(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: API_KEY,
          },
          body: JSON.stringify({
            coordinates: [
              [origen[1], origen[0]], // Longitud, Latitud
              [destino[1], destino[0]],
            ],
          }),
        }
      );

      if (!response.ok) throw new Error("Error al obtener la ruta");

      const data = await response.json();
      const ruta = L.geoJSON(data, {
        style: {
          color: "green",
          weight: 5,
        },
      }).addTo(map);
    } catch (error) {
      console.error("Error trazando la ruta:", error);
      alert("No se pudo trazar la ruta. Intenta más tarde.");
    }
  }

  inicializarMapa();
});
