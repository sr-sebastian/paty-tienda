// Piezas compartidas entre la tienda (app.js) y el panel (admin.js).
(function () {
  const CATEGORIAS = [
    { id: "perfumes", label: "Perfumes", grupo: "natura" },
    { id: "cuidado", label: "Cuidado personal", grupo: "natura" },
    { id: "sabanas", label: "Sábanas", grupo: "blanqueria" },
    { id: "toallas", label: "Toallas", grupo: "blanqueria" },
    { id: "hogar", label: "Acolchados y mantas", grupo: "blanqueria" },
    { id: "ropa_interior", label: "Ropa interior", grupo: "ropa" },
    { id: "otros", label: "Otros", grupo: "otros" },
  ];

  const GRUPOS = [
    { id: "natura", label: "Natura" },
    { id: "blanqueria", label: "Blanquería" },
    { id: "ropa", label: "Ropa interior" },
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
    ropa: [
      { id: "rose", label: "Rosa" },
      { id: "nude", label: "Nude" },
      { id: "black", label: "Negro" },
      { id: "white", label: "Blanco" },
      { id: "wine", label: "Bordó" },
      { id: "lilac", label: "Lila" },
    ],
  };

  const SVG = "http://www.w3.org/2000/svg";

  // Dibujo de un corpiño, para productos de ropa interior sin foto.
  function prenda(tono) {
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 120 80");
    const trazos = [
      ["tiras", "M30 6 L36 38 M90 6 L84 38"],
      ["", "M12 40 C14 66 50 70 58 48 C50 36 28 32 12 40 Z M108 40 C106 66 70 70 62 48 C70 36 92 32 108 40 Z"],
      ["tiras", "M58 48 L62 48 M12 40 L6 46 M108 40 L114 46"],
    ];
    for (const [clase, d] of trazos) {
      const p = document.createElementNS(SVG, "path");
      if (clase) p.setAttribute("class", clase);
      p.setAttribute("d", d);
      svg.appendChild(p);
    }
    return el("div", { class: "prenda r-" + tono, "aria-hidden": "true" }, [svg]);
  }

  function grupoDe(cat) {
    const c = CATEGORIAS.find((x) => x.id === cat);
    return c ? c.grupo : "otros";
  }

  function coloresPara(cat) {
    const g = grupoDe(cat);
    return g === "natura" ? COLORES.natura : g === "ropa" ? COLORES.ropa : COLORES.telas;
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
    if (grupoDe(p.cat) === "ropa") {
      return prenda(COLORES.ropa.some((c) => c.id === p.color) ? p.color : "rose");
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
