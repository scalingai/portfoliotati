# Portfolio — Tatiana Orquera

Sitio estático de una sola página. HTML, CSS y JS puros: sin build, sin
dependencias, sin framework. Implementado a partir del handoff de Claude Design
(`tatiana-orquera-portfolio/`), que se conserva como referencia del diseño.

```
index.html          Estructura y contenido
styles.css          Todos los estilos
main.js             Menú mobile, filtro del portfolio, track del proceso,
                    fondo WebGL del hero
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
- **Proceso creativo:** vive **dentro de "Lo que hago"** (`#servicios`), después
  de las tarjetas de servicio y hoy cierra la sección. Antes era una aparte y la
  fila "Producción" de `#servicios` repetía 5 de sus 7 pasos; al fusionarlas se
  eliminó esa fila y la sección `#proceso`. El `id` se conserva en el riel para
  que el link del nav siga funcionando.

  Los 7 pasos son un riel horizontal con íconos que se dibujan al entrar. Un
  mismo markup, tres modos que elige el JS al medir: `pin` (el contenedor se
  estira lo que sobra del riel y la banda queda `sticky` a media altura, así el
  scroll vertical la desplaza de lado), `drag` (carrusel con `scroll-snap`, sin
  JS o con `prefers-reduced-motion`) y `static` (no hay sobrante horizontal: se
  ocultan la barra y el contador y se dibujan los 7 íconos). La banda no
  tiene alto fijo: mide lo que mida su contenido y el JS calcula el `top` que la
  centra, así una fuente de fallback o un texto más grande no recortan nada.
  Los íconos son de [Lucide](https://lucide.dev) (ISC), pegados inline y
  animados con `pathLength="1"` + `stroke-dashoffset`, sin librería ni runtime.

  **En mobile (≤860px) los 7 pasos van uno debajo del otro**, no de costado: el
  riel obligaba a arrastrar en horizontal para leer una lista que se lee sola
  scrolleando, y la tarjeta de al lado tapaba a medias la que estabas leyendo.
  Es sólo CSS (`flex-direction: column` en el track) — al no quedar sobrante
  horizontal el JS mide `travel = 0` y entra solo en modo `static`, así que no
  hubo que tocar la lógica de modos.
- **Resultados / sparklines:** las dos tarjetas del panel oscuro rematan en una
  curva ascendente. **Es decoración, no un gráfico**: no tiene eje de meses ni
  porcentaje de variación, justamente para no afirmar un dato que el sitio no
  puede respaldar. Por eso van `aria-hidden` — los únicos datos de la sección
  son los dos números, que sí son reales.

  Aun así la geometría está calculada y no dibujada a ojo: los `path` salen de
  `node scripts/sparklines.mjs`, que convierte una serie de valores en una
  Bézier que pasa por cada punto. Si algún día se quiere la curva real, se
  cargan los valores ahí y se pegan los dos `path` (línea y área) que imprime.

  La línea se dibuja sola al entrar en pantalla (`pathLength="1"` +
  `stroke-dashoffset`, la misma técnica que los íconos del proceso). Sin JS o
  con `prefers-reduced-motion` la curva se ve entera y quieta.

  El meta de la sección es el glifo de Instagram (trazo, hereda el gris del
  contexto). Al no haber texto al lado, lleva `role="img"` +
  `aria-label="Instagram"`: es el único que dice de dónde salen los números.

- **CTAs de contacto:** los 4 botones (nav, panel mobile, hero y footer) abren
  WhatsApp con un mensaje prellenado. El número y el texto viven en el propio
  `href` de cada uno: para cambiarlos, buscá `wa.me` en `index.html` — son 4
  ocurrencias idénticas. Están en el HTML y no en el JS a propósito: sin JS el
  link tiene que seguir funcionando.

  El número es `5491126948688` (+54 9 11 2694-8688). Formato de `wa.me`: código
  de país + 9 + área sin el 0 + número sin el 15, todo junto y sin espacios ni
  guiones — cualquier símbolo rompe el link.

- **Datos de contacto:** el mail (`tatuabril73@gmail.com`, que pasó a ser la
  alternativa secundaria del footer) y el usuario de Instagram
  (`@tatiiorquera`) están escritos en `index.html`. Para cambiarlos, buscá y
  reemplazá ahí.

Agregados sobre el prototipo, sin tocar lo visual: `lang="es"`, meta tags y Open
Graph, `aria-expanded`/`aria-selected` en menú y filtros, cierre del menú con
Escape, foco visible, y respeto por `prefers-reduced-motion` (frena el ticker y
congela el shader). El shader además pausa cuando el hero sale de pantalla.
