(function () {
  const tienda = window.TIENDA;
  const productos = window.PRODUCTOS;
  const CLAVE = "paty-tienda-pedido";

  const FILTROS = [
    { id: "todos", label: "Todos" },
    { id: "natura", label: "Natura", grupo: true },
    { id: "perfumes", label: "Perfumes" },
    { id: "cuidado", label: "Cuidado personal" },
    { id: "blanqueria", label: "Blanquería", grupo: true },
    { id: "sabanas", label: "Sábanas" },
    { id: "toallas", label: "Toallas" },
    { id: "hogar", label: "Acolchados y mantas" },
  ];

  let filtro = "todos";
  let pedido = leerPedido();

  function leerPedido() {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE) || "{}");
      const valido = {};
      for (const id in guardado) {
        if (productos.some((p) => p.id === id) && guardado[id] > 0) valido[id] = guardado[id];
      }
      return valido;
    } catch (e) {
      return {};
    }
  }

  function guardarPedido() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(pedido));
    } catch (e) {}
  }

  function el(tag, attrs, hijos) {
    const nodo = document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === "texto") nodo.textContent = attrs[k];
      else if (k.startsWith("on")) nodo.addEventListener(k.slice(2), attrs[k]);
      else nodo.setAttribute(k, attrs[k]);
    }
    for (const h of hijos || []) if (h) nodo.appendChild(h);
    return nodo;
  }

  function formatoPrecio(p) {
    return typeof p === "number" ? "$ " + p.toLocaleString("es-UY") : "Consultar";
  }

  function arte(p) {
    if (p.grupo === "natura") {
      return el("div", { class: "caja " + p.tono, "aria-hidden": "true" }, [
        el("span", { class: "ln", texto: p.caja[0] }),
        el("span", { class: "sub", texto: p.caja[1] }),
      ]);
    }
    return el(
      "div",
      { class: "pila", "aria-hidden": "true" },
      p.telas.map((t) => el("div", { class: "tela t-" + t + (p.franja ? " franja" : "") }))
    );
  }

  function cambiarCantidad(id, cantidad) {
    if (cantidad <= 0) delete pedido[id];
    else pedido[id] = cantidad;
    guardarPedido();
    render();
  }

  function renderFiltros() {
    const cont = document.getElementById("filtros");
    cont.replaceChildren(
      ...FILTROS.map((f) =>
        el("button", {
          type: "button",
          class: "chip" + (f.grupo ? " grupo" : ""),
          "aria-pressed": String(filtro === f.id),
          texto: f.label,
          onclick: () => {
            filtro = f.id;
            render();
          },
        })
      )
    );
  }

  function renderGrilla() {
    const visibles = productos.filter((p) => filtro === "todos" || p.cat === filtro || p.grupo === filtro);
    document.getElementById("grilla").replaceChildren(
      ...visibles.map((p) => {
        const cant = pedido[p.id] || 0;
        return el("article", { class: "producto" }, [
          el("div", { class: "producto-arte" }, [
            p.prontaEntrega ? el("span", { class: "badge", texto: "Pronta entrega" }) : null,
            arte(p),
          ]),
          el("div", { class: "producto-info" }, [
            el("span", { class: "producto-linea", texto: p.linea }),
            el("h3", { texto: p.nombre }),
            el("p", { class: "producto-desc", texto: p.desc + " · " + p.tamano }),
          ]),
          el("div", { class: "producto-pie" }, [
            el("span", { class: "precio", texto: formatoPrecio(p.precio) }),
            el("button", {
              type: "button",
              class: "agregar" + (cant ? " en-pedido" : ""),
              "aria-label": cant ? "Agregar otro " + p.nombre + " (hay " + cant + ")" : "Agregar " + p.nombre,
              texto: cant ? "En tu pedido (" + cant + ") +" : "Agregar",
              onclick: () => cambiarCantidad(p.id, cant + 1),
            }),
          ]),
        ]);
      })
    );
  }

  function itemsPedido() {
    return productos.filter((p) => pedido[p.id]).map((p) => ({ p: p, cant: pedido[p.id] }));
  }

  function renderPedido(items, total) {
    document.getElementById("pedido-titulo").textContent =
      total === 0 ? "Vacío por ahora" : total === 1 ? "1 producto" : total + " productos";
    document.getElementById("pedido-vacio").hidden = total > 0;
    document.getElementById("pedido-items").hidden = total === 0;
    document.getElementById("pedido-acciones").hidden = total === 0;
    document.getElementById("pedido-items").replaceChildren(
      ...items.map(({ p, cant }) =>
        el("li", { class: "item" }, [
          el("div", {}, [
            el("span", { class: "item-nombre", texto: p.nombre }),
            el("span", { class: "item-detalle", texto: p.tamano + " · " + formatoPrecio(p.precio) }),
          ]),
          el("div", { class: "cantidad" }, [
            el("button", { type: "button", class: "qty", "aria-label": "Quitar uno de " + p.nombre, texto: "−", onclick: () => cambiarCantidad(p.id, cant - 1) }),
            el("output", { texto: String(cant) }),
            el("button", { type: "button", class: "qty", "aria-label": "Agregar uno de " + p.nombre, texto: "+", onclick: () => cambiarCantidad(p.id, cant + 1) }),
          ]),
        ])
      )
    );
  }

  function linkWhatsapp(items) {
    const msg = items.length
      ? "¡Hola " + tienda.duena + "! Quiero hacer este pedido:\n" +
        items.map(({ p, cant }) => "- " + cant + " x " + p.nombre + " (" + p.tamano + ")").join("\n")
      : "¡Hola " + tienda.duena + "! Quiero consultar por tus productos.";
    const numero = String(tienda.whatsapp).replace(/[^0-9]/g, "");
    return "https://wa.me/" + numero + "?text=" + encodeURIComponent(msg);
  }

  function render() {
    const items = itemsPedido();
    const total = items.reduce((n, it) => n + it.cant, 0);
    renderFiltros();
    renderGrilla();
    renderPedido(items, total);
    document.getElementById("contador").textContent = total;
    const href = linkWhatsapp(items);
    document.querySelectorAll("[data-wa]").forEach((a) => (a.href = href));
  }

  document.querySelectorAll("[data-tienda]").forEach((n) => (n.textContent = tienda.nombre));
  document.querySelectorAll("[data-filtro]").forEach((a) =>
    a.addEventListener("click", () => {
      filtro = a.getAttribute("data-filtro");
      render();
    })
  );
  document.getElementById("vaciar").addEventListener("click", () => {
    pedido = {};
    guardarPedido();
    render();
  });

  render();
})();
