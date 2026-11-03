# Tienda de Patricia Camargo

Catálogo web de productos Natura y blanquería (sábanas, toallas, acolchados y más). Los clientes arman su pedido en la página y lo mandan por WhatsApp con la lista ya escrita.

- **Tienda:** `index.html` → https://sr-sebastian.github.io/paty-tienda/
- **Panel para cargar productos y datos:** `admin.html` → https://sr-sebastian.github.io/paty-tienda/admin.html

Los productos, las fotos y los datos de la tienda se guardan en [Supabase](https://supabase.com) (plan gratuito). Mientras no esté conectado, la tienda muestra los productos de ejemplo de `datos-ejemplo.js`.

## Puesta en marcha (una sola vez)

1. **Crear el proyecto.** Entrá a https://supabase.com, creá una cuenta y un proyecto nuevo (cualquier nombre, región São Paulo).
2. **Crear las tablas.** En el proyecto: **SQL Editor → New query**, pegá todo el contenido de [`supabase/esquema.sql`](supabase/esquema.sql) y tocá **Run**. Crea las tablas, los permisos, la carpeta de fotos y carga los productos de ejemplo.
3. **Crear el usuario de Patricia.** **Authentication → Users → Add user → Create new user**, con su email y una contraseña. Marcá *Auto Confirm User*.
4. **Darle permiso para editar.** Corré [`supabase/admins.sql`](supabase/admins.sql) en el **SQL Editor**: las cuentas con los emails de esa lista quedan como administradoras al crearse, aunque se creen después. Reemplazá `EMAIL_DE_PATRICIA` por su email solo en el SQL Editor, no en el repo (es público). Ya está corrido para Patricia.
5. **Cerrar el registro.** **Authentication → Sign In / Providers → Email**: desactivá *Allow new users to sign up*. Así nadie más puede crearse una cuenta. Igual, solo los usuarios de la tabla `admins` pueden editar.
6. **Conectar la página.** En **Project Settings → API** copiá la *Project URL* y la clave *anon public* (o *publishable*) y pegalas en [`config.js`](config.js). Esa clave es pública a propósito; lo que protege los datos son los permisos del paso 2. **Nunca** pongas la clave *service_role* / *secret*.
7. Subí el cambio a `main`. En uno o dos minutos la tienda ya lee de Supabase.

## Uso diario (Patricia)

Entrá a `admin.html` con tu email y contraseña.

- **Productos:** *Nuevo producto* para agregar, *Editar* para cambiar o eliminar. Podés subir una foto desde el celular (se achica sola). Sin foto, se muestra un dibujo con el color que elijas.
  - *Precio* vacío muestra "Consultar".
  - *Visible en la tienda* destildado lo esconde sin borrarlo (útil si te quedaste sin stock).
  - *Orden*: los números más bajos aparecen primero.
- **Datos de la tienda:** nombre, tu nombre, WhatsApp, zona de envíos, formas de pago y el texto de "Sobre mí".

Los cambios se ven en la tienda al recargar la página.

## Archivos

| Archivo | Qué es |
| --- | --- |
| `index.html`, `app.js`, `styles.css` | La tienda |
| `admin.html`, `admin.js`, `admin.css` | El panel |
| `catalogo.js` | Categorías, colores y dibujos, compartidos por los dos |
| `config.js` | Conexión con Supabase |
| `datos-ejemplo.js` | Productos que se ven mientras no hay Supabase |
| `supabase/esquema.sql` | Tablas y permisos |
