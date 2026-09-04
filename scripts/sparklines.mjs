// Genera los path de las sparklines. Correr de nuevo si cambian los datos.
const W = 320, H = 56, PADX = 8, TOP = 9, BOT = 44, BASE = H;

const round = n => Math.round(n * 10) / 10;

function build(vals) {
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const pts = vals.map((v, i) => [
    round(PADX + (W - PADX * 2) * (i / (vals.length - 1))),
    round(BOT - (BOT - TOP) * ((v - min) / span)),
  ]);

  // Catmull-Rom -> cubica de Bezier, con tension baja: la curva pasa por cada
  // punto real y no inventa picos entre medio.
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [round(p1[0] + (p2[0] - p0[0]) / 6), round(p1[1] + (p2[1] - p0[1]) / 6)];
    const c2 = [round(p2[0] - (p3[0] - p1[0]) / 6), round(p2[1] - (p3[1] - p1[1]) / 6)];
    d += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  // El relleno se estira hasta los bordes del viewBox: si terminara donde
  // termina la curva quedaria un canto vertical a la derecha del ultimo punto.
  const a = pts[0], z = pts[pts.length - 1];
  const area = `M0 ${a[1]} L${a[0]} ${a[1]}` + d.slice(d.indexOf(' C'))
    + ` L${W} ${z[1]} L${W} ${BASE} L0 ${BASE} Z`;
  return { line: d, area, last: pts[pts.length - 1], pts };
}

const sets = {
  views: [186000, 214000, 268000, 331000, 402000, 516700],
  reach: [104000, 131000, 158000, 205000, 246000, 310000],
};

for (const [k, v] of Object.entries(sets)) {
  const s = build(v);
  console.log('--- ' + k + ' ---');
  console.log('line: ' + s.line);
  console.log('area: ' + s.area);
  console.log('dot : cx=' + s.last[0] + ' cy=' + s.last[1]);
  console.log('delta: +' + Math.round((v[5] / v[4] - 1) * 100) + '%');
}
