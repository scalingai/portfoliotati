/* Tatiana Orquera — Portfolio
   Behaviour ported from the Claude Design prototype:
   mobile menu, portfolio filter, and the WebGL hero backdrop. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- nav */

  var burger = document.querySelector('.nav__burger');
  var panel = document.getElementById('nav-panel');

  function closeMenu() {
    panel.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && panel) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      panel.hidden = open;
      burger.setAttribute('aria-expanded', String(!open));
    });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) {
        closeMenu();
        burger.focus();
      }
    });

    // The prototype closes the menu whenever it crosses the desktop breakpoint.
    var mq = window.matchMedia('(max-width: 860px)');
    var onMq = function () { closeMenu(); };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else mq.addListener(onMq);
  }

  /* ---------------------------------------------------- portfolio filter */

  var portfolio = document.querySelector('.portfolio');

  if (portfolio) {
    var tabs = portfolio.querySelectorAll('.tab');

    portfolio.addEventListener('click', function (e) {
      var tab = e.target.closest('.tab');
      if (!tab) return;

      portfolio.dataset.cat = tab.dataset.cat;
      tabs.forEach(function (t) {
        t.setAttribute('aria-selected', String(t === tab));
      });
    });
  }

  /* ------------------------------------------------- reel cover fallback */

  // Covers live in assets/reels/. Until one is dropped in, the frame falls
  // back to the design's empty-slot treatment instead of a broken image.
  document.querySelectorAll('.reel__frame img').forEach(function (img) {
    var markEmpty = function () { img.parentElement.classList.add('reel__frame--empty'); };
    if (img.complete && img.naturalWidth === 0) markEmpty();
    img.addEventListener('error', markEmpty);
  });

  /* -------------------------------------------------------- scroll reveal */

  // Cada bloque entra con un fade y un desplazamiento corto al asomar en
  // pantalla. El estado inicial se marca desde acá y no desde el HTML: si no
  // hay IntersectionObserver o el sistema pide menos movimiento, no se aplica
  // nada y la pagina queda visible completa.
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        // Se revela una sola vez: volver a ocultar al scrollear para arriba
        // marea y obliga a re-animar contenido ya leido.
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });

    // El escalonado se cuenta por contenedor, no sobre el total: si fuera
    // global, el ultimo reel del tercer grupo arrancaria medio segundo tarde.
    var stagger = function (selector, step) {
      var scopes = new Map();

      document.querySelectorAll(selector).forEach(function (el) {
        el.setAttribute('data-reveal', '');

        if (step) {
          var i = scopes.get(el.parentElement) || 0;
          scopes.set(el.parentElement, i + 1);
          el.style.setProperty('--reveal-delay', (i * step) + 'ms');
        }

        io.observe(el);
      });
    };

    document.documentElement.classList.add('js-reveal');

    stagger('.sec-head');
    stagger('.sobre__aside');
    stagger('.sobre__body > *', 40);
    stagger('.card', 70);
    stagger('.group__head');
    stagger('.reel', 70);
    stagger('.steplist li', 45);
    stagger('.metrics__cell', 70);
    stagger('.why__title');
    stagger('.why__list');
  }

  /* ------------------------------------------------------- hero backdrop */

  var hero = document.querySelector('.hero');
  var canvas = document.querySelector('.hero__canvas');
  var spot = document.querySelector('.hero__spot');

  if (!hero || !canvas) return;

  var mouse = [0.5, 0.55];

  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;

    var r = hero.getBoundingClientRect();
    var x = e.clientX - r.left;
    var y = e.clientY - r.top;

    mouse = [x / r.width, 1 - y / r.height];

    if (spot) {
      spot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      spot.style.opacity = '1';
    }
  });

  hero.addEventListener('pointerleave', function () {
    if (spot) spot.style.opacity = '0';
  });

  var gl = canvas.getContext('webgl', { antialias: false, alpha: false });

  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  var vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

  var fs = [
    'precision highp float;',
    'uniform vec2 u_res;uniform float u_t;uniform vec2 u_m;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    'return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}',
    'float fbm(vec2 p){float a=.5,v=0.;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.02;a*=.5;}return v;}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/u_res.xy;float ar=u_res.x/max(u_res.y,1.);vec2 p=uv*vec2(ar,1.);',
    ' float t=u_t*.045;',
    ' vec2 q=vec2(fbm(p*1.6+vec2(t,-t*.7)),fbm(p*1.6+vec2(3.2-t*.6,1.7+t*.4)));',
    ' float f=fbm(p*2.2+q*1.9+vec2(-t*.5,t*.3));',
    ' float g=mix(.78,1.0,smoothstep(.22,.88,f));',
    ' g-=.09*smoothstep(.75,.1,length(uv-vec2(.5,1.05)));',
    ' float m=1.-smoothstep(0.,.5,length((uv-u_m)*vec2(ar,1.)));',
    ' g+=.06*m;',
    ' gl_FragColor=vec4(vec3(clamp(g,0.,1.)),1.);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  }

  var prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  var loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, 'u_res');
  var uT = gl.getUniformLocation(prog, 'u_t');
  var uM = gl.getUniformLocation(prog, 'u_m');

  var start = performance.now();
  var raf = 0;
  var visible = true;

  function draw() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    var h = Math.max(1, Math.round(canvas.clientHeight * dpr));

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    gl.uniform2f(uRes, w, h);
    gl.uniform2f(uM, mouse[0], mouse[1]);
    gl.uniform1f(uT, reduceMotion ? 0 : (performance.now() - start) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // A still frame is enough when the field isn't animating or isn't on screen.
    if (reduceMotion || !visible) { raf = 0; return; }
    raf = requestAnimationFrame(draw);
  }

  function play() {
    if (!raf) raf = requestAnimationFrame(draw);
  }

  // Don't burn a render loop on a hero that has scrolled out of view.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) play();
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: 0 }).observe(hero);
  }

  window.addEventListener('resize', function () {
    if (!raf) requestAnimationFrame(draw);
  });

  draw();
})();
