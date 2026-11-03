// Conexión con Supabase. Los dos valores están en Supabase → Project Settings → API.
// La "anon public key" es pública a propósito: los permisos los controla el esquema (supabase/esquema.sql).
// Mientras estén vacíos, la página muestra los datos de ejemplo de datos-ejemplo.js.
window.SUPABASE = {
  url: "",
  anonKey: "",
};
