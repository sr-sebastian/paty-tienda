# Tienda de Patricia Camargo

Catálogo web de productos Natura y blanquería (sábanas, toallas, acolchados y mantas). Los clientes arman su pedido en la página y lo envían por WhatsApp con la lista ya escrita.

Es un sitio estático: no necesita instalar nada ni compilar. Abrí `index.html` en el navegador para verlo.

## Cómo editarlo

Todo lo que cambia seguido está en [`productos.js`](productos.js):

- `TIENDA.nombre`: el nombre de la tienda (aparece arriba y en el pie).
- `TIENDA.whatsapp`: el número con código de país, sin `+` ni espacios (ej. `59899123456`).
- `PRODUCTOS`: la lista de productos. Para cada uno se puede cambiar nombre, descripción, tamaño, `precio` (un número, o `null` para mostrar "Consultar") y `prontaEntrega`.

Los textos fijos (envíos, formas de pago, "Sobre mí") están en `index.html`, marcados entre corchetes, por ejemplo `[TU ZONA]`.

## Publicarlo

Con GitHub Pages: en el repositorio, **Settings → Pages → Deploy from a branch → `main` / root**. La página queda en `https://sr-sebastian.github.io/paty-tienda/`.
