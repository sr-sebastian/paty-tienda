// Datos que se muestran solo mientras Supabase no está configurado (config.js vacío).
// Los datos reales se cargan desde el panel: admin.html

window.DATOS_EJEMPLO = {
  tienda: {
    nombre: "[Nombre de la tienda]",
    duena: "Patricia Camargo",
    whatsapp: "",
    zona: "[TU ZONA]",
    pagos: "[MÉTODOS]",
    sobre: "Vendo productos Natura y blanquería para la casa: sábanas, toallas y más. Te ayudo a encontrar el perfume, el juego de cama o el regalo justo.",
  },
  productos: [
    { id: "desejos", cat: "perfumes", linea: "Natura · Essencial", nombre: "Essencial Desejos", descripcion: "Deo parfum femenino, edición festiva", tamano: "100 ml", precio: null, pronta_entrega: true, color: "plum" },
    { id: "floral", cat: "perfumes", linea: "Natura · Essencial", nombre: "Essencial Exclusivo Floral", descripcion: "Deo parfum femenino", tamano: "100 ml", precio: null, pronta_entrega: true, color: "ivory" },
    { id: "oud", cat: "perfumes", linea: "Natura · Essencial", nombre: "Essencial Oud", descripcion: "Deo parfum masculino", tamano: "100 ml", precio: null, pronta_entrega: false, color: "ink" },
    { id: "kaiak", cat: "perfumes", linea: "Natura · Kaiak", nombre: "Kaiak Clásico", descripcion: "Deo colonia masculina", tamano: "100 ml", precio: null, pronta_entrega: false, color: "sea" },
    { id: "luna", cat: "perfumes", linea: "Natura · Luna", nombre: "Luna Radiante", descripcion: "Deo parfum femenino", tamano: "75 ml", precio: null, pronta_entrega: false, color: "rose" },
    { id: "tododia", cat: "cuidado", linea: "Natura · Tododia", nombre: "Tododia Frambuesa y Pimienta Rosa", descripcion: "Crema nutritiva corporal", tamano: "400 ml", precio: null, pronta_entrega: false, color: "berry" },
    { id: "maracuya", cat: "cuidado", linea: "Natura · Ekos", nombre: "Ekos Maracuyá", descripcion: "Aceite trifásico corporal", tamano: "200 ml", precio: null, pronta_entrega: false, color: "amber" },
    { id: "chronos", cat: "cuidado", linea: "Natura · Chronos", nombre: "Chronos Antiseñales", descripcion: "Crema facial de día", tamano: "40 g", precio: null, pronta_entrega: false, color: "sand" },
    { id: "sab2", cat: "sabanas", linea: "Blanquería · Sábanas", nombre: "Juego de sábanas 2 plazas", descripcion: "[Material / hilos]", tamano: "Sábana, bajera y 2 fundas", precio: null, pronta_entrega: true, color: "white" },
    { id: "sab1", cat: "sabanas", linea: "Blanquería · Sábanas", nombre: "Juego de sábanas 1 plaza", descripcion: "[Material / hilos]", tamano: "Sábana, bajera y funda", precio: null, pronta_entrega: false, color: "blue" },
    { id: "toallon", cat: "toallas", linea: "Blanquería · Toallas", nombre: "Juego toalla y toallón", descripcion: "[Material / gramaje]", tamano: "[Medidas]", precio: null, pronta_entrega: true, color: "sage" },
    { id: "manos", cat: "toallas", linea: "Blanquería · Toallas", nombre: "Set de toallas de mano", descripcion: "[Material]", tamano: "[Cantidad y medidas]", precio: null, pronta_entrega: false, color: "clay" },
    { id: "acolchado", cat: "hogar", linea: "Blanquería · Hogar", nombre: "Acolchado 2 plazas", descripcion: "[Relleno / tela]", tamano: "[Medidas]", precio: null, pronta_entrega: false, color: "plum" },
    { id: "manta", cat: "hogar", linea: "Blanquería · Hogar", nombre: "Manta", descripcion: "[Material]", tamano: "[Medidas]", precio: null, pronta_entrega: false, color: "grey" },
  ],
};
