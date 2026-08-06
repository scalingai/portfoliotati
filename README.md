# Portfolio — Tatiana Orquera

Sitio estático de una sola página. HTML, CSS y JS puros: sin build, sin
dependencias, sin framework. Implementado a partir del handoff de Claude Design
(`tatiana-orquera-portfolio/`), que se conserva como referencia del diseño.

```
index.html          Estructura y contenido
styles.css          Todos los estilos
main.js             Menú mobile, filtro del portfolio, fondo WebGL del hero
assets/
  tat-sobre.webp    Retrato de la sección "Sobre mí"
  tat-hero.webp     Retrato alternativo (sin usar — quedó del diseño original)
  reels/            Portadas de los reels — ver assets/reels/README.md
tatiana-orquera-portfolio/   Bundle original de Claude Design (referencia)
```

## Ver el sitio

Cualquier servidor estático sirve. Por ejemplo:

```bash
npx --yes http-server . -p 4173 -c-1
```

Después abrí http://localhost:4173. Abrir `index.html` directo con doble clic
también funciona, pero conviene el servidor para que las rutas relativas se
comporten igual que en producción.

## Publicar

No hay paso de build: subí la carpeta tal cual a Netlify, Vercel, GitHub Pages o
cualquier hosting estático. Se puede excluir `tatiana-orquera-portfolio/` y
`.claude/` del deploy — son material de referencia, no del sitio.

## Qué falta

Las 7 portadas de los reels. El diseño las dejó como slots vacíos, así que las
tarjetas muestran el estado vacío ("Portada del reel") hasta que existan los
archivos. Instrucciones en [`assets/reels/README.md`](assets/reels/README.md).

## Detalles de implementación

- **Fondo del hero:** shader WebGL (fbm noise) portado tal cual del prototipo,
  con un halo que sigue al mouse. Si el navegador no soporta WebGL, el canvas se
  oculta y queda el fondo `#f1f0ee` — no rompe nada.
- **Breakpoint:** 860px, el mismo que usaba el prototipo para cambiar entre nav
  de escritorio y menú hamburguesa.
- **Filtro del portfolio:** el `<section>` guarda la categoría activa en
  `data-cat` y el CSS oculta los grupos que no corresponden.
- **Datos de contacto:** el mail (`tatuabril73@gmail.com`) y el usuario de
  Instagram (`@tatiiorquera`) están escritos en `index.html`. Para cambiarlos,
  buscá y reemplazá ahí.

Agregados sobre el prototipo, sin tocar lo visual: `lang="es"`, meta tags y Open
Graph, `aria-expanded`/`aria-selected` en menú y filtros, cierre del menú con
Escape, foco visible, y respeto por `prefers-reduced-motion` (frena el ticker y
congela el shader). El shader además pausa cuando el hero sale de pantalla.
