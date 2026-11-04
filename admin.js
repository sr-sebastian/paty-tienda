(function () {
  const { CATEGORIAS, coloresPara, el, formatoPrecio, arte } = window.Catalogo;
  const sb = window.Catalogo.cliente();
  const $ = (id) => document.getElementById(id);

  let productos = [];
  let editando = null; // producto que se está editando (null = nuevo)
  let fotoNueva = null; // Blob elegido en el formulario
  let fotoPreviaUrl = null; // URL local para la vista previa
  let quitarFoto = false;

  function mostrarMensaje(texto, esError) {
    const m = $("mensaje");
    m.textContent = texto;
    m.classList.toggle("error", !!esError);
    m.hidden = false;
    clearTimeout(mostrarMensaje.t);
    if (!esError) mostrarMensaje.t = setTimeout(() => (m.hidden = true), 4000);
  }

  function explicarError(e) {
    const msg = (e && e.message) || String(e);
    if (/row-level security|permission|not allowed|Unauthorized/i.test(msg)) {
      return "Tu usuario no tiene permiso para editar. Revisá que esté cargado en la tabla de administradores (ver README).";
    }
    if (/Invalid login credentials/i.test(msg)) return "Email o contraseña incorrectos.";
    return "No se pudo guardar: " + msg;
  }

  function mostrar(vista) {
    $("sin-config").hidden = vista !== "sin-config";
    $("vista-login").hidden = vista !== "login";
    $("vista-clave").hidden = vista !== "clave";
    $("vista-panel").hidden = vista !== "panel";
    $("salir").hidden = vista !== "panel";
  }

  // ---------- Sesión ----------

  // Los links de invitación y de "olvidé mi contraseña" llegan con #...type=invite|recovery.
  const vieneDeMail = /type=(invite|recovery)/.test(location.hash);
  const errorDeMail = /error_description=([^&]+)/.exec(location.hash);

  async function iniciar() {
    if (!sb) return mostrar("sin-config");
    if (errorDeMail) {
      history.replaceState(null, "", location.pathname);
      mostrar("login");
      return mostrarMensaje("El link del mail venció o ya se usó. Pedí uno nuevo con «Olvidé mi contraseña».", true);
    }
    const { data } = await sb.auth.getSession();
    if (data.session && vieneDeMail) {
      history.replaceState(null, "", location.pathname);
      return mostrar("clave");
    }
    if (data.session) await abrirPanel();
    else mostrar("login");
  }

  $("form-clave").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const f = ev.target;
    if (f.password.value !== f.repetir.value) return mostrarMensaje("Las dos contraseñas no coinciden.", true);
    const boton = f.querySelector("button");
    boton.disabled = true;
    const { error } = await sb.auth.updateUser({ password: f.password.value });
    boton.disabled = false;
    if (error) return mostrarMensaje("No se pudo guardar la contraseña: " + error.message, true);
    f.reset();
    mostrarMensaje("Contraseña guardada.");
    await abrirPanel();
  });

  $("olvide").addEventListener("click", async () => {
    const email = $("form-login").email.value.trim();
    if (!email) {
      $("form-login").email.focus();
      return mostrarMensaje("Escribí tu email arriba y tocá de nuevo «Olvidé mi contraseña».", true);
    }
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    if (error) return mostrarMensaje("No se pudo mandar el mail: " + error.message, true);
    mostrarMensaje("Si ese email tiene cuenta, te llegó un mail con un link para elegir una contraseña nueva.");
  });

  $("form-login").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const f = ev.target;
    const boton = f.querySelector("button");
    boton.disabled = true;
    const { error } = await sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.password.value });
    boton.disabled = false;
    if (error) return mostrarMensaje(explicarError(error), true);
    $("mensaje").hidden = true;
    await abrirPanel();
  });

  $("salir").addEventListener("click", async () => {
    await sb.auth.signOut();
    mostrar("login");
  });

  async function abrirPanel() {
    mostrar("panel");
    const { data: esAdmin } = await sb.rpc("es_admin");
    if (!esAdmin) {
      mostrarMensaje("Entraste, pero tu usuario todavía no tiene permiso para editar. Pedí que lo agreguen como administrador (ver README).", true);
    }
    await Promise.all([cargarTienda(), cargarProductos()]);
  }

  // ---------- Datos de la tienda ----------

  async function cargarTienda() {
    const { data, error } = await sb.from("tienda").select("*").eq("id", 1).maybeSingle();
    if (error) return mostrarMensaje(explicarError(error), true);
    const f = $("form-tienda");
    for (const k of ["nombre", "duena", "whatsapp", "zona", "pagos", "sobre"]) f[k].value = (data && data[k]) || "";
  }

  $("form-tienda").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const f = ev.target;
    const boton = f.querySelector("button[type=submit]");
    const datos = {
      nombre: f.nombre.value.trim(),
      duena: f.duena.value.trim(),
      whatsapp: f.whatsapp.value.replace(/[^0-9]/g, ""),
      zona: f.zona.value.trim(),
      pagos: f.pagos.value.trim(),
      sobre: f.sobre.value.trim(),
      actualizado: new Date().toISOString(),
    };
    boton.disabled = true;
    const { data, error } = await sb.from("tienda").update(datos).eq("id", 1).select();
    boton.disabled = false;
    if (error) return mostrarMensaje(explicarError(error), true);
    if (!data.length) return mostrarMensaje(explicarError({ message: "permission" }), true);
    f.whatsapp.value = datos.whatsapp;
    mostrarMensaje("Datos guardados. Ya se ven en la tienda.");
  });

  // ---------- Lista de productos ----------

  async function cargarProductos() {
    const { data, error } = await sb.from("productos").select("*").order("orden").order("nombre");
    if (error) return mostrarMensaje(explicarError(error), true);
    productos = data.map((p) => Object.assign({}, p, { precio: p.precio === null ? null : Number(p.precio) }));
    renderLista();
  }

  function etiquetaCat(cat) {
    const c = CATEGORIAS.find((x) => x.id === cat);
    return c ? c.label : cat;
  }

  function renderLista() {
    const q = $("buscar").value.trim().toLowerCase();
    const visibles = productos.filter((p) => !q || (p.nombre + " " + p.linea + " " + etiquetaCat(p.cat)).toLowerCase().includes(q));
    if (!visibles.length) {
      $("lista").replaceChildren(el("li", { class: "aviso", texto: q ? "Ningún producto coincide con la búsqueda." : "Todavía no hay productos. Tocá «Nuevo producto»." }));
      return;
    }
    $("lista").replaceChildren(
      ...visibles.map((p) =>
        el("li", { class: "fila-producto" + (p.activo ? "" : " oculto") }, [
          el("div", { class: "mini" }, [arte(p)]),
          el("div", { class: "fila-info" }, [
            el("span", { class: "fila-nombre", texto: p.nombre }),
            el("span", { class: "fila-meta" }, [
              document.createTextNode([etiquetaCat(p.cat), p.tamano].filter(Boolean).join(" · ")),
              p.activo ? null : el("span", { class: "etiqueta-estado", texto: "Oculto" }),
              p.pronta_entrega ? el("span", { class: "etiqueta-estado", texto: "Pronta entrega" }) : null,
            ]),
          ]),
          el("span", { class: "fila-precio", texto: formatoPrecio(p.precio) }),
          el("button", { type: "button", class: "editar", texto: "Editar", "aria-label": "Editar " + p.nombre, onclick: () => abrirDialogo(p) }),
        ])
      )
    );
  }

  $("buscar").addEventListener("input", renderLista);
  $("nuevo").addEventListener("click", () => abrirDialogo(null));

  // ---------- Formulario de producto ----------

  const form = $("form-producto");

  $("sel-cat").replaceChildren(
    ...window.Catalogo.GRUPOS.map((g) =>
      el(
        "optgroup",
        { label: g.label },
        CATEGORIAS.filter((c) => c.grupo === g.id).map((c) => el("option", { value: c.id, texto: c.label }))
      )
    )
  );

  function llenarColores(cat, actual) {
    const opciones = coloresPara(cat);
    $("sel-color").replaceChildren(...opciones.map((c) => el("option", { value: c.id, texto: c.label })));
    $("sel-color").value = opciones.some((c) => c.id === actual) ? actual : opciones[0].id;
  }

  function liberarVistaPrevia() {
    if (fotoPreviaUrl) URL.revokeObjectURL(fotoPreviaUrl);
    fotoPreviaUrl = null;
  }

  function borrador() {
    let foto = editando && !quitarFoto ? editando.foto_url : null;
    if (fotoPreviaUrl) foto = fotoPreviaUrl;
    return {
      nombre: form.nombre.value.trim() || "Nuevo producto",
      cat: form.cat.value,
      color: form.color.value,
      foto_url: foto,
    };
  }

  function actualizarVistaPrevia() {
    const b = borrador();
    $("vista-previa").replaceChildren(arte(b));
    $("quitar-foto").hidden = !b.foto_url;
    $("campo-color").hidden = !!b.foto_url;
  }

  function abrirDialogo(p) {
    editando = p;
    fotoNueva = null;
    quitarFoto = false;
    liberarVistaPrevia();
    form.reset();
    $("dialogo-titulo").textContent = p ? "Editar producto" : "Nuevo producto";
    $("eliminar").hidden = !p;
    const v = p || { cat: "perfumes", activo: true, orden: (productos.reduce((m, x) => Math.max(m, x.orden), 0) || 0) + 10 };
    form.nombre.value = v.nombre || "";
    form.cat.value = v.cat;
    form.linea.value = v.linea || "";
    form.descripcion.value = v.descripcion || "";
    form.tamano.value = v.tamano || "";
    form.precio.value = v.precio === null || v.precio === undefined ? "" : v.precio;
    form.pronta_entrega.checked = !!v.pronta_entrega;
    form.activo.checked = v.activo !== false;
    form.orden.value = v.orden ?? 100;
    llenarColores(v.cat, v.color);
    actualizarVistaPrevia();
    $("dialogo").showModal();
    form.nombre.focus();
  }

  function cerrarDialogo() {
    liberarVistaPrevia();
    $("dialogo").close();
  }

  $("cerrar").addEventListener("click", cerrarDialogo);
  $("cancelar").addEventListener("click", cerrarDialogo);
  form.nombre.addEventListener("input", actualizarVistaPrevia);
  $("sel-color").addEventListener("change", actualizarVistaPrevia);
  $("sel-cat").addEventListener("change", () => {
    llenarColores(form.cat.value, form.color.value);
    actualizarVistaPrevia();
  });

  // Achica la foto a 1200 px como máximo para que cargue rápido en el celular.
  async function achicar(archivo) {
    const img = await createImageBitmap(archivo);
    const k = Math.min(1, 1200 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return new Promise((ok) => c.toBlob(ok, "image/jpeg", 0.85));
  }

  $("input-foto").addEventListener("change", async (ev) => {
    const archivo = ev.target.files[0];
    if (!archivo) return;
    try {
      fotoNueva = await achicar(archivo);
    } catch (e) {
      return mostrarMensaje("No se pudo leer esa imagen. Probá con una foto JPG o PNG.", true);
    }
    quitarFoto = false;
    liberarVistaPrevia();
    fotoPreviaUrl = URL.createObjectURL(fotoNueva);
    actualizarVistaPrevia();
  });

  $("quitar-foto").addEventListener("click", () => {
    fotoNueva = null;
    quitarFoto = true;
    liberarVistaPrevia();
    $("input-foto").value = "";
    actualizarVistaPrevia();
  });

  function rutaEnBucket(url) {
    const marca = "/storage/v1/object/public/fotos/";
    const i = url ? url.indexOf(marca) : -1;
    return i >= 0 ? decodeURIComponent(url.slice(i + marca.length)) : null;
  }

  async function borrarFoto(url) {
    const ruta = rutaEnBucket(url);
    if (ruta) await sb.storage.from("fotos").remove([ruta]);
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const boton = $("guardar");
    boton.disabled = true;
    try {
      const precio = form.precio.value === "" ? null : Number(form.precio.value);
      const datos = {
        nombre: form.nombre.value.trim(),
        cat: form.cat.value,
        linea: form.linea.value.trim(),
        descripcion: form.descripcion.value.trim(),
        tamano: form.tamano.value.trim(),
        precio: precio,
        pronta_entrega: form.pronta_entrega.checked,
        activo: form.activo.checked,
        orden: parseInt(form.orden.value, 10) || 100,
        color: form.color.value,
      };
      const fotoAnterior = editando ? editando.foto_url : null;
      if (fotoNueva) {
        const ruta = Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ".jpg";
        const subida = await sb.storage.from("fotos").upload(ruta, fotoNueva, { contentType: "image/jpeg" });
        if (subida.error) throw subida.error;
        datos.foto_url = sb.storage.from("fotos").getPublicUrl(ruta).data.publicUrl;
      } else if (quitarFoto) {
        datos.foto_url = null;
      }

      const res = editando
        ? await sb.from("productos").update(datos).eq("id", editando.id).select()
        : await sb.from("productos").insert(datos).select();
      if (res.error) throw res.error;
      if (!res.data.length) throw { message: "permission" };

      if (fotoAnterior && (fotoNueva || quitarFoto)) await borrarFoto(fotoAnterior);
      cerrarDialogo();
      mostrarMensaje(editando ? "Producto actualizado." : "Producto agregado.");
      await cargarProductos();
    } catch (e) {
      mostrarMensaje(explicarError(e), true);
    } finally {
      boton.disabled = false;
    }
  });

  $("eliminar").addEventListener("click", async () => {
    if (!editando) return;
    if (!confirm("¿Eliminar «" + editando.nombre + "»? No se puede deshacer. Si solo querés esconderlo, destildá «Visible en la tienda».")) return;
    const { data, error } = await sb.from("productos").delete().eq("id", editando.id).select();
    if (error || !data.length) return mostrarMensaje(explicarError(error || { message: "permission" }), true);
    await borrarFoto(editando.foto_url);
    cerrarDialogo();
    mostrarMensaje("Producto eliminado.");
    await cargarProductos();
  });

  iniciar().catch((e) => mostrarMensaje(explicarError(e), true));
})();
