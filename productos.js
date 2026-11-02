// Datos de la tienda. Editá este archivo para cambiar nombre, WhatsApp y productos.

window.TIENDA = {
  nombre: "[Nombre de la tienda]",
  duena: "Patricia",
  // Número con código de país, sin + ni espacios. Ej.: 59899123456
  whatsapp: "598XXXXXXXX",
};

// grupo: "natura" (se dibuja como caja) o "blanqueria" (se dibuja como pila de telas)
// cat: perfumes | cuidado | sabanas | toallas | hogar
// precio: número (ej. 1290) o null para mostrar "Consultar"
window.PRODUCTOS = [
  { id: "desejos", grupo: "natura", cat: "perfumes", linea: "Natura · Essencial", nombre: "Essencial Desejos", desc: "Deo parfum femenino, edición festiva", tamano: "100 ml", precio: null, prontaEntrega: true, tono: "plum", caja: ["Essencial", "Desejos"] },
  { id: "floral", grupo: "natura", cat: "perfumes", linea: "Natura · Essencial", nombre: "Essencial Exclusivo Floral", desc: "Deo parfum femenino", tamano: "100 ml", precio: null, prontaEntrega: true, tono: "ivory", caja: ["Essencial", "Exclusivo Floral"] },
  { id: "oud", grupo: "natura", cat: "perfumes", linea: "Natura · Essencial", nombre: "Essencial Oud", desc: "Deo parfum masculino", tamano: "100 ml", precio: null, prontaEntrega: false, tono: "ink", caja: ["Essencial", "Oud"] },
  { id: "kaiak", grupo: "natura", cat: "perfumes", linea: "Natura · Kaiak", nombre: "Kaiak Clásico", desc: "Deo colonia masculina", tamano: "100 ml", precio: null, prontaEntrega: false, tono: "sea", caja: ["Kaiak", "Clásico"] },
  { id: "luna", grupo: "natura", cat: "perfumes", linea: "Natura · Luna", nombre: "Luna Radiante", desc: "Deo parfum femenino", tamano: "75 ml", precio: null, prontaEntrega: false, tono: "rose", caja: ["Luna", "Radiante"] },
  { id: "tododia", grupo: "natura", cat: "cuidado", linea: "Natura · Tododia", nombre: "Tododia Frambuesa y Pimienta Rosa", desc: "Crema nutritiva corporal", tamano: "400 ml", precio: null, prontaEntrega: false, tono: "berry", caja: ["Tododia", "Frambuesa"] },
  { id: "maracuya", grupo: "natura", cat: "cuidado", linea: "Natura · Ekos", nombre: "Ekos Maracuyá", desc: "Aceite trifásico corporal", tamano: "200 ml", precio: null, prontaEntrega: false, tono: "amber", caja: ["Ekos", "Maracuyá"] },
  { id: "chronos", grupo: "natura", cat: "cuidado", linea: "Natura · Chronos", nombre: "Chronos Antiseñales", desc: "Crema facial de día", tamano: "40 g", precio: null, prontaEntrega: false, tono: "sand", caja: ["Chronos", "Antiseñales"] },
  { id: "sab2", grupo: "blanqueria", cat: "sabanas", linea: "Blanquería · Sábanas", nombre: "Juego de sábanas 2 plazas", desc: "[Material / hilos]", tamano: "Sábana, bajera y 2 fundas", precio: null, prontaEntrega: true, telas: ["white", "white", "linen"] },
  { id: "sab1", grupo: "blanqueria", cat: "sabanas", linea: "Blanquería · Sábanas", nombre: "Juego de sábanas 1 plaza", desc: "[Material / hilos]", tamano: "Sábana, bajera y funda", precio: null, prontaEntrega: false, telas: ["blue", "blue", "white"] },
  { id: "toallon", grupo: "blanqueria", cat: "toallas", linea: "Blanquería · Toallas", nombre: "Juego toalla y toallón", desc: "[Material / gramaje]", tamano: "[Medidas]", precio: null, prontaEntrega: true, telas: ["sage", "sage", "white"], franja: true },
  { id: "manos", grupo: "blanqueria", cat: "toallas", linea: "Blanquería · Toallas", nombre: "Set de toallas de mano", desc: "[Material]", tamano: "[Cantidad y medidas]", precio: null, prontaEntrega: false, telas: ["clay", "sand", "rose"], franja: true },
  { id: "acolchado", grupo: "blanqueria", cat: "hogar", linea: "Blanquería · Hogar", nombre: "Acolchado 2 plazas", desc: "[Relleno / tela]", tamano: "[Medidas]", precio: null, prontaEntrega: false, telas: ["plum", "linen", "linen"] },
  { id: "manta", grupo: "blanqueria", cat: "hogar", linea: "Blanquería · Hogar", nombre: "Manta", desc: "[Material]", tamano: "[Medidas]", precio: null, prontaEntrega: false, telas: ["grey", "sand", "grey"] },
];
