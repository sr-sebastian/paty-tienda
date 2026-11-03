// Piezas compartidas entre la tienda (app.js) y el panel (admin.js).
(function () {
  const CATEGORIAS = [
    { id: "perfumes", label: "Perfumes", grupo: "natura" },
    { id: "cuidado", label: "Cuidado personal", grupo: "natura" },
    { id: "sabanas", label: "Sábanas", grupo: "blanqueria" },
    { id: "toallas", label: "Toallas", grupo: "blanqueria" },
    { id: "hogar", label: "Acolchados y mantas", grupo: "blanqueria" },
    { id: "otros", label: "Otros", grupo: "otros" },
  ];

  const GRUPOS = [
    { id: "natura", label: "Natura" },
    { id: "blanqueria", label: "Blanquería" },
    { id: "otros", label: "Otros" },
  ];

  // Colores del dibujo cuando el producto no tiene foto.
  const COLORES = {
    natura: [
      { id: "plum", label: "Bordó con puntos" },
      { id: "ivory", label: "Marfil" },
      { id: "ink", label: "Negro y dorado" },
      { id: "sea", label: "Verde agua" },
      { id: "rose", label: "Rosa" },
      { id: "berry", label: "Frambuesa" },
      { id: "amber", label: "Ámbar" },
      { id: "sand", label: "Arena" },
    ],
    telas: [
      { id: "white", label: "Blanco" },
      { id: "linen", label: "Lino" },
      { id: "sand", label: "Arena" },
      { id: "grey", label: "Gris" },
      { id: "sage", label: "Verde salvia" },
      { id: "blue", label: "Celeste" },
      { id: "rose", label: "Rosa" },
      { id: "clay", label: "Terracota" },
      { id: "plum", label: "Bordó" },
    ],
  };

  function grupoDe(cat) {
    const c = CATEGORIAS.find((x) => x.id === cat);
    return c ? c.grupo : "otros";
  }

  function coloresPara(cat) {
    return grupoDe(cat) === "natura" ? COLORES.natura : COLORES.telas;
  }

  function el(tag, attrs, hijos) {
    const nodo = document.createElement(tag);
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === "texto") nodo.textContent = v;
      else if (k.startsWith("on")) nodo.addEventListener(k.slice(2), v);
      else nodo.setAttribute(k, v === true ? "" : v);
    }
    for (const h of hijos || []) if (h) nodo.appendChild(h);
    return nodo;
  }

  function formatoPrecio(precio) {
    return typeof precio === "number" && !isNaN(precio)
      ? "$ " + precio.toLocaleString("es-UY", { maximumFractionDigits: 2 })
      : "Consultar";
  }

  // Foto si la hay; si no, una caja (Natura) o una pila de telas (blanquería y otros).
  function arte(p) {
    if (p.foto_url) {
      return el("img", { class: "foto", src: p.foto_url, alt: p.nombre, loading: "lazy" });
    }
    if (grupoDe(p.cat) === "natura") {
      const palabras = p.nombre.trim().split(/\s+/);
      const tono = COLORES.natura.some((c) => c.id === p.color) ? p.color : "plum";
      return el("div", { class: "caja " + tono, "aria-hidden": "true" }, [
        el("div", { class: "rotulo" }, [
          el("span", { class: "ln", texto: palabras[0] }),
          palabras.length > 1 ? el("span", { class: "sub", texto: palabras.slice(1).join(" ") }) : null,
        ]),
      ]);
    }
    const c = COLORES.telas.some((x) => x.id === p.color) ? p.color : "linen";
    const telas = [c, c, c === "white" ? "linen" : "white"];
    const franja = p.cat === "toallas" ? " franja" : "";
    return el(
      "div",
      { class: "pila", "aria-hidden": "true" },
      telas.map((t) => el("div", { class: "tela t-" + t + franja }))
    );
  }

  function cliente() {
    const cfg = window.SUPABASE || {};
    if (!cfg.url || !cfg.anonKey || !window.supabase) return null;
    return window.supabase.createClient(cfg.url, cfg.anonKey);
  }

  window.Catalogo = { CATEGORIAS, GRUPOS, COLORES, grupoDe, coloresPara, el, formatoPrecio, arte, cliente };
})();
