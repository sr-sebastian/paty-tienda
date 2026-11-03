(function () {
  const { CATEGORIAS, GRUPOS, grupoDe, el, formatoPrecio, arte } = window.Catalogo;
  const CLAVE = "paty-tienda-pedido";

  let tienda = window.DATOS_EJEMPLO.tienda;
  let productos = [];
  let filtro = "todos";
  let pedido = {};

  async function cargar() {
    const sb = window.Catalogo.cliente();
    if (!sb) {
      return { tienda: window.DATOS_EJEMPLO.tienda, productos: window.DATOS_EJEMPLO.productos };
    }
    const [t, p] = await Promise.all([
      sb.from("tienda").select("*").eq("id", 1).maybeSingle(),
      sb.from("productos").select("*").eq("activo", true).order("orden").order("nombre"),
    ]);
    if (t.error) throw t.error;
    if (p.error) throw p.error;
    return {
      tienda: Object.assign({}, window.DATOS_EJEMPLO.tienda, t.data || {}),
      productos: p.data.map((x) => Object.assign({}, x, { precio: x.precio === null ? null : Number(x.precio) })),
    };
  }

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

  function cambiarCantidad(id, cantidad) {
    if (cantidad <= 0) delete pedido[id];
    else pedido[id] = cantidad;
    guardarPedido();
    render();
  }

  function filtrosDisponibles() {
    const usadas = new Set(productos.map((p) => p.cat));
    const lista = [{ id: "todos", label: "Todos" }];
    for (const g of GRUPOS) {
      const cats = CATEGORIAS.filter((c) => c.grupo === g.id && usadas.has(c.id));
      if (!cats.length) continue;
      lista.push({ id: g.id, label: g.label, grupo: true });
      // Un grupo con una sola categoría del mismo nombre ("Otros") no necesita otro botón.
      if (cats.length === 1 && cats[0].label === g.label) continue;
      for (const c of cats) lista.push({ id: c.id, label: c.label });
    }
    return lista;
  }

  function renderFiltros() {
    document.getElementById("filtros").replaceChildren(
      ...filtrosDisponibles().map((f) =>
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
    const visibles = productos.filter((p) => filtro === "todos" || p.cat === filtro || grupoDe(p.cat) === filtro);
    const grilla = document.getElementById("grilla");
    if (!visibles.length) {
      grilla.replaceChildren(el("p", { class: "aviso", texto: "No hay productos en esta sección por ahora." }));
      return;
    }
    grilla.replaceChildren(
      ...visibles.map((p) => {
        const cant = pedido[p.id] || 0;
        const detalle = [p.descripcion, p.tamano].filter(Boolean).join(" · ");
        return el("article", { class: "producto" }, [
          el("div", { class: "producto-arte" + (p.foto_url ? " con-foto" : "") }, [
            p.pronta_entrega ? el("span", { class: "badge", texto: "Pronta entrega" }) : null,
            arte(p),
          ]),
          el("div", { class: "producto-info" }, [
            p.linea ? el("span", { class: "producto-linea", texto: p.linea }) : null,
            el("h3", { texto: p.nombre }),
            detalle ? el("p", { class: "producto-desc", texto: detalle }) : null,
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
            el("span", { class: "item-detalle", texto: [p.tamano, formatoPrecio(p.precio)].filter(Boolean).join(" · ") }),
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

  function primerNombre() {
    return (tienda.duena || "").trim().split(/\s+/)[0] || "";
  }

  function linkWhatsapp(items) {
    const hola = "¡Hola " + primerNombre() + "!";
    const msg = items.length
      ? hola + " Quiero hacer este pedido:\n" +
        items.map(({ p, cant }) => "- " + cant + " x " + p.nombre + (p.tamano ? " (" + p.tamano + ")" : "")).join("\n")
      : hola + " Quiero consultar por tus productos.";
    const numero = String(tienda.whatsapp || "").replace(/[^0-9]/g, "");
    return "https://wa.me/" + numero + "?text=" + encodeURIComponent(msg);
  }

  function renderTienda() {
    document.querySelectorAll("[data-campo]").forEach((n) => {
      const v = tienda[n.getAttribute("data-campo")];
      if (v) n.textContent = v;
    });
    const iniciales = (tienda.duena || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
    document.getElementById("avatar").textContent = iniciales;
    document.title = tienda.nombre + " · Natura y blanquería";
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

  cargar()
    .then((datos) => {
      tienda = datos.tienda;
      productos = datos.productos;
      pedido = leerPedido();
      renderTienda();
      render();
    })
    .catch((e) => {
      console.error(e);
      document.getElementById("grilla").replaceChildren(
        el("p", { class: "aviso", texto: "No pudimos cargar los productos. Probá de nuevo en un rato o escribime por WhatsApp." })
      );
    });
})();
