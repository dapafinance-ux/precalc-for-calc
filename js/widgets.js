/* Interactive widgets. Each factory returns {el, draw}. */
(function (global) {
  const { h, tex } = U;
  const redraws = new Set();
  window.addEventListener('resize', () => redraws.forEach((f) => f()));
  const W = { clearRedraws: () => redraws.clear() };

  function slider(label, min, max, step, value, onInput, fmt) {
    const out = h('span', { class: 'sval' });
    const inp = h('input', { type: 'range', min, max, step, value });
    const show = () => { out.textContent = fmt ? fmt(+inp.value) : (+inp.value).toString(); };
    inp.addEventListener('input', () => { show(); onInput(+inp.value); });
    show();
    const wrap = h('label', { class: 'slider' }, h('span', { class: 'slabel', html: label }), inp, out);
    wrap.input = inp; wrap.set = (v) => { inp.value = v; show(); };
    return wrap;
  }
  function select(options, value, onChange) {
    const s = h('select', null, ...options.map(([v, l]) => { const o = h('option', { value: v }, l); if (v === value) o.selected = true; return o; }));
    s.addEventListener('change', () => onChange(s.value));
    return s;
  }
  function frame(title, controls, canvas, readout, note, wide) {
    return h('div', { class: 'widget' + (wide ? ' wide' : '') },
      h('div', { class: 'widget-title' }, h('span', { class: 'dot' }), title),
      h('div', { class: 'widget-body' },
        h('div', { class: 'widget-canvas' }, canvas),
        h('div', { class: 'widget-side' }, controls, readout, note ? h('p', { class: 'wnote', html: note }) : null)));
  }
  function canvas(ratio) { const c = h('canvas', { class: 'plot' }); c.style.aspectRatio = ratio || '1.45'; return c; }
  function mount(draw) { redraws.add(draw); requestAnimationFrame(() => requestAnimationFrame(draw)); }
  const f2 = (v) => (+v.toFixed(2)).toString();
  const signed = (v) => (v >= 0 ? '+ ' + f2(v) : '- ' + f2(-v));
  const coef = (a) => (a === 1 ? '' : a === -1 ? '-' : f2(a));
  const argTex = (b, hh) => { const inner = hh === 0 ? 'x' : `x ${signed(-hh)}`; return b === 1 ? inner : hh === 0 ? `${f2(b)}x` : `${f2(b)}(${inner})`; };
  const plus = (k) => (k === 0 ? '' : ' ' + signed(k));

  /* ---------- 1. Vertex form / completing the square ---------- */
  W.vertex = function () {
    const st = { a: 1, b: -4, c: 1 };
    const cv = canvas(); const g = new Graph(cv, { xmin: -8, xmax: 8, ymin: -8, ymax: 8 });
    const ro = h('div', { class: 'readout' });
    const draw = () => {
      const { a, b, c } = st; if (a === 0) st.a = 0.5;
      const hh = -b / (2 * a), k = c - (b * b) / (4 * a), D = b * b - 4 * a * c;
      g.clear().axes().fn((x) => a * x * x + b * x + c);
      g.vline(hh, { color: 'rgba(239,111,108,0.5)' });
      g.point(hh, k, { color: getComputedStyle(document.documentElement).getPropertyValue('--c3') });
      let roots = 'no real roots';
      if (D >= 0) {
        const r1 = (-b - Math.sqrt(D)) / (2 * a), r2 = (-b + Math.sqrt(D)) / (2 * a);
        g.point(r1, 0, { color: '#5ec8f2' }); if (D > 0) g.point(r2, 0, { color: '#5ec8f2' });
        roots = D === 0 ? `x = ${f2(r1)}\\ (\\text{double})` : `x = ${f2(Math.min(r1, r2))},\\ ${f2(Math.max(r1, r2))}`;
      }
      ro.innerHTML =
        `<div>${tex(`y = ${f2(a)}x^2 ${signed(b)}x ${signed(c)}`)}</div>` +
        `<div>${tex(`y = ${f2(a)}(x ${signed(-hh)})^2 ${signed(k)}`)}</div>` +
        `<div class="muted">vertex ${tex(`(${f2(hh)}, ${f2(k)})`)}</div>` +
        `<div class="muted">${tex(`D = b^2-4ac = ${f2(D)}`)}</div>` +
        `<div class="muted">${tex(roots)}</div>`;
    };
    const controls = h('div', { class: 'controls' },
      slider('$a$', -3, 3, 0.5, st.a, (v) => { st.a = v || 0.5; draw(); }),
      slider('$b$', -8, 8, 1, st.b, (v) => { st.b = v; draw(); }),
      slider('$c$', -8, 8, 1, st.c, (v) => { st.c = v; draw(); }));
    mount(draw);
    return frame('Completing the square: standard → vertex form', controls, cv, ro, 'Red dot = vertex $\\left(-\\frac{b}{2a},\\ c-\\frac{b^2}{4a}\\right)$. Blue dots = real roots. Watch the discriminant decide how many roots there are.');
  };

  /* ---------- 2. Function transformer ---------- */
  const PARENTS = {
    'x^2': [(x) => x * x, 'x^2'], 'x^3': [(x) => x ** 3, 'x^3'], sqrt: [Math.sqrt, '\\sqrt{x}'], cbrt: [Math.cbrt, '\\sqrt[3]{x}'],
    abs: [Math.abs, '|x|'], recip: [(x) => 1 / x, '\\frac{1}{x}'], recip2: [(x) => 1 / (x * x), '\\frac{1}{x^2}'],
    exp: [Math.exp, 'e^{x}'], ln: [Math.log, '\\ln x'], sin: [Math.sin, '\\sin x'], cos: [Math.cos, '\\cos x'], tan: [Math.tan, '\\tan x'],
    asin: [Math.asin, '\\arcsin x'], atan: [Math.atan, '\\arctan x'],
  };
  W.transform = function () {
    const st = { p: 'x^2', a: 1, b: 1, h: 0, k: 0 };
    const cv = canvas(); const g = new Graph(cv, { xmin: -8, xmax: 8, ymin: -6, ymax: 6 });
    const ro = h('div', { class: 'readout' });
    const draw = () => {
      const [f, ftex] = PARENTS[st.p];
      g.clear().axes();
      g.fn(f, { color: 'rgba(255,255,255,0.35)', dash: [5, 5], width: 1.6 });
      g.fn((x) => st.a * f(st.b * (x - st.h)) + st.k);
      const arg = argTex(st.b, st.h);
      const inner = arg === 'x' ? ftex : ftex.replace(/x/g, `\\left(${arg}\\right)`);
      ro.innerHTML = `<div>${tex(`y = ${coef(st.a)}` + inner + plus(st.k))}</div>` +
        `<div class="muted">parent ${tex('y=' + ftex)} (dashed)</div>` +
        `<ul class="tight small">` +
        `<li>${st.h ? `shift ${st.h > 0 ? 'right' : 'left'} ${Math.abs(st.h)}` : 'no horizontal shift'}</li>` +
        `<li>${st.k ? `shift ${st.k > 0 ? 'up' : 'down'} ${Math.abs(st.k)}` : 'no vertical shift'}</li>` +
        `<li>${Math.abs(st.a) !== 1 ? `vertical ${Math.abs(st.a) > 1 ? 'stretch' : 'compression'} ×${Math.abs(st.a)}` : 'no vertical stretch'}${st.a < 0 ? ', reflect over x-axis' : ''}</li>` +
        `<li>${Math.abs(st.b) !== 1 ? `horizontal ${Math.abs(st.b) > 1 ? 'compression' : 'stretch'} ×${f2(1 / Math.abs(st.b))}` : 'no horizontal stretch'}${st.b < 0 ? ', reflect over y-axis' : ''}</li></ul>`;
    };
    const controls = h('div', { class: 'controls' },
      h('label', { class: 'slider' }, h('span', { class: 'slabel' }, 'parent'), select(Object.keys(PARENTS).map((k) => [k, PARENTS[k][1].replace(/\\frac\{1\}\{(.+?)\}/, '1/$1').replace(/\\|[{}]/g, '').replace('sqrt[3]', 'cbrt ')]), st.p, (v) => { st.p = v; draw(); })),
      slider('$a$', -3, 3, 0.5, 1, (v) => { st.a = v; draw(); }),
      slider('$b$', -3, 3, 0.5, 1, (v) => { st.b = v === 0 ? 0.5 : v; draw(); }),
      slider('$h$', -5, 5, 0.5, 0, (v) => { st.h = v; draw(); }),
      slider('$k$', -5, 5, 0.5, 0, (v) => { st.k = v; draw(); }));
    mount(draw);
    return frame('Transformations: $y = a\\,f(b(x-h)) + k$', controls, cv, ro);
  };

  /* ---------- 3. Tangent line / point-slope ---------- */
  const CURVES = {
    'x^2': [(x) => x * x, (x) => 2 * x, 'x^2'], 'x^3-3x': [(x) => x ** 3 - 3 * x, (x) => 3 * x * x - 3, 'x^3-3x'],
    sqrt: [Math.sqrt, (x) => 0.5 / Math.sqrt(x), '\\sqrt{x}'], sin: [Math.sin, Math.cos, '\\sin x'],
    exp: [Math.exp, Math.exp, 'e^x'], ln: [Math.log, (x) => 1 / x, '\\ln x'],
  };
  W.tangentline = function () {
    const st = { c: 'x^2', a: 1, normal: false };
    const cv = canvas(); const g = new Graph(cv, { xmin: -5, xmax: 5, ymin: -4, ymax: 6 });
    const ro = h('div', { class: 'readout' });
    const draw = () => {
      const [f, df, ft] = CURVES[st.c];
      const a = st.a, fa = f(a), m = df(a);
      g.clear().axes().fn(f);
      if (!isFinite(fa) || !isFinite(m)) { ro.innerHTML = `<div class="muted">${tex('x=' + f2(a))} is outside the domain of ${tex(ft)}.</div>`; return; }
      g.fn((x) => fa + m * (x - a), { color: '#5ec8f2', width: 2 });
      if (st.normal && m !== 0) g.fn((x) => fa - (x - a) / m, { color: '#b48cf2', width: 1.6, dash: [6, 4] });
      g.point(a, fa);
      ro.innerHTML = `<div>${tex(`f(x) = ${ft}`)}</div>` +
        `<div>point ${tex(`(${f2(a)},\\ ${f2(fa)})`)}, slope ${tex(`m = f'(${f2(a)}) = ${f2(m)}`)}</div>` +
        `<div class="hl">${tex(`y - ${f2(fa)} = ${f2(m)}(x - ${f2(a)})`)}</div>` +
        `<div class="muted">${tex(`y = ${f2(m)}x ${signed(fa - m * a)}`)}</div>` +
        (st.normal && m !== 0 ? `<div class="muted">normal: ${tex(`m_\\perp = ${f2(-1 / m)}`)}</div>` : '');
    };
    const nchk = h('input', { type: 'checkbox' }); nchk.addEventListener('change', () => { st.normal = nchk.checked; draw(); });
    const controls = h('div', { class: 'controls' },
      h('label', { class: 'slider' }, h('span', { class: 'slabel' }, 'curve'), select(Object.keys(CURVES).map((k) => [k, k]), st.c, (v) => { st.c = v; draw(); })),
      slider('$a$', -4, 4, 0.25, 1, (v) => { st.a = v; draw(); }),
      h('label', { class: 'check' }, nchk, ' show normal line'));
    mount(draw);
    return frame('Tangent line in point-slope form', controls, cv, ro, 'The slope comes from calculus (you\'ll learn $f\'$ soon). The line itself is pure precalc: point-slope form.');
  };

  /* ---------- 4. Rational function explorer ---------- */
  W.rational = function () {
    const st = { deg: 2, n1: 2, n2: -2, d1: 2, d2: -1, c: 1 };
    const cv = canvas(); const g = new Graph(cv, { xmin: -8, xmax: 8, ymin: -8, ymax: 8 });
    const ro = h('div', { class: 'readout' });
    const prod = (arr, x) => arr.reduce((p, r) => p * (x - r), 1);
    const fac = (arr) => (arr.length ? arr.map((r) => (r === 0 ? 'x' : `(${U.lin(r)})`)).join('') : '1');
    const draw = () => {
      const nums = [[], [st.n1], [st.n1, st.n2], [st.n1, st.n2, 0]][st.deg];
      const dens = [st.d1, st.d2];
      const N = nums.slice(), D = dens.slice(), holes = [];
      for (let i = N.length - 1; i >= 0; i--) { const j = D.indexOf(N[i]); if (j >= 0) { holes.push(N[i]); N.splice(i, 1); D.splice(j, 1); } }
      const red = (x) => (st.c * prod(N, x)) / prod(D, x);
      const VAs = [...new Set(D)];
      const nd = nums.length, dd = dens.length;
      const ha = nd < dd ? 0 : nd === dd ? st.c : null;
      g.clear().axes();
      VAs.forEach((v) => g.vline(v));
      if (ha !== null) g.hline(ha, { color: 'rgba(94,200,242,0.6)' });
      let slant = '';
      if (nd === dd + 1) {
        // quotient of degree-1 by evaluating far out: q(x) = mx + b
        const m = st.c, b0 = st.c * (st.d1 + st.d2 - st.n1 - st.n2); // (x^3 - s1 x^2 ...)/(x^2 - s2 x ...) => x + (s2 - s1)
        g.fn((x) => m * x + b0, { color: 'rgba(94,200,242,0.6)', dash: [6, 5], width: 1.6 });
        slant = tex(`y = ${m === 1 ? '' : m === -1 ? '-' : m}x ${signed(b0)}`);
      }
      g.fn((x) => (st.c * prod(nums, x)) / prod(dens, x));
      holes.forEach((x0) => { const y0 = red(x0); if (isFinite(y0)) g.point(x0, y0, { hollow: true }); });
      const cTex = st.c === 1 ? '' : st.c === -1 ? '-' : st.c;
      ro.innerHTML = `<div>${tex(`f(x) = \\dfrac{${cTex}${fac(nums)}}{${fac(dens)}}`)}</div>` +
        `<div><b>Holes:</b> ${holes.length ? holes.map((x0) => { const y0 = red(x0); return tex(`\\left(${x0},\\ ${isFinite(y0) ? f2(y0) : '\\text{VA}'}\\right)`); }).join(', ') : 'none'}</div>` +
        `<div><b>Vertical asymptotes:</b> ${VAs.length ? VAs.map((v) => tex('x=' + v)).join(', ') : 'none'}</div>` +
        `<div><b>Horizontal asymptote:</b> ${ha === null ? 'none' : tex('y = ' + ha)}</div>` +
        (slant ? `<div><b>Slant asymptote:</b> ${slant}</div>` : '') +
        `<div class="small muted">degree top ${nd} vs bottom ${dd} &rarr; ${nd < dd ? 'HA y = 0' : nd === dd ? 'HA = ratio of leading coefficients' : 'no HA; slant asymptote from long division'}</div>`;
    };
    const controls = h('div', { class: 'controls' },
      slider('top degree', 0, 3, 1, 2, (v) => { st.deg = v; draw(); }),
      slider('zero $r_1$', -5, 5, 1, st.n1, (v) => { st.n1 = v; draw(); }),
      slider('zero $r_2$', -5, 5, 1, st.n2, (v) => { st.n2 = v; draw(); }),
      slider('pole $p_1$', -5, 5, 1, st.d1, (v) => { st.d1 = v; draw(); }),
      slider('pole $p_2$', -5, 5, 1, st.d2, (v) => { st.d2 = v; draw(); }),
      slider('lead $c$', -3, 3, 1, 1, (v) => { st.c = v || 1; draw(); }));
    mount(draw);
    return frame('Rational functions: holes & asymptotes', controls, cv, ro, 'Set a zero equal to a pole to create a <b>hole</b> (open circle). Top degree 3 adds a factor of $x$ to show a slant asymptote.');
  };

  /* ---------- 5. Exponential & log ---------- */
  W.explog = function () {
    const st = { b: 2, showE: true };
    const cv = canvas(); const g = new Graph(cv, { xmin: -6, xmax: 6, ymin: -5, ymax: 6 });
    g.view.ystep = 1; g.view.xstep = 1;
    const ro = h('div', { class: 'readout' });
    const draw = () => {
      const b = st.b;
      g.clear().axes();
      g.fn((x) => x, { color: 'rgba(255,255,255,0.3)', dash: [4, 4], width: 1.2 });
      if (st.showE) { g.fn(Math.exp, { color: 'rgba(245,185,66,0.35)', width: 1.4 }); g.fn(Math.log, { color: 'rgba(94,200,242,0.35)', width: 1.4 }); }
      g.fn((x) => Math.pow(b, x));
      g.fn((x) => Math.log(x) / Math.log(b), { color: '#5ec8f2' });
      g.point(0, 1); g.point(1, 0, { color: '#5ec8f2' }); g.point(1, b); g.point(b, 1, { color: '#5ec8f2' });
      ro.innerHTML = `<div>${tex(`y = ${f2(b)}^x`)} <span class="muted">and its inverse</span> ${tex(`y = \\log_{${f2(b)}} x = \\dfrac{\\ln x}{\\ln ${f2(b)}}`)}</div>` +
        `<div class="small">${b > 1 ? 'b &gt; 1: growth' : 'b &lt; 1: decay'} &middot; ${tex(`\\ln ${f2(b)} = ${f2(Math.log(b))}`)}</div>` +
        `<div class="small muted">Points ${tex('(0,1)\\leftrightarrow(1,0)')} and ${tex(`(1,${f2(b)})\\leftrightarrow(${f2(b)},1)`)} mirror over ${tex('y=x')}. Faint curves: ${tex('e^x')} and ${tex('\\ln x')}.</div>` +
        `<div class="small muted">Domain of ${tex('\\log')}: ${tex('x>0')}. Vertical asymptote ${tex('x=0')}; horizontal asymptote of ${tex('b^x')}: ${tex('y=0')}.</div>`;
    };
    const chk = h('input', { type: 'checkbox', checked: '' }); chk.addEventListener('change', () => { st.showE = chk.checked; draw(); });
    const controls = h('div', { class: 'controls' },
      slider('base $b$', 0.2, 5, 0.05, 2, (v) => { st.b = Math.abs(v - 1) < 0.01 ? 1.05 : v; draw(); }, (v) => (+v.toFixed(2)).toString()),
      h('button', { class: 'btn ghost small', onclick: () => { st.b = Math.E; controls.firstChild.set(Math.E); draw(); } }, 'set b = e'),
      h('label', { class: 'check' }, chk, ' show eˣ and ln x'));
    mount(draw);
    return frame('Exponentials & logs are inverses', controls, cv, ro);
  };

  /* ---------- 6. Unit circle ---------- */
  const EX = { // exact values for reference angles in units of pi/12
    0: ['0', '1'], 2: ['\\frac12', '\\frac{\\sqrt3}2'], 3: ['\\frac{\\sqrt2}2', '\\frac{\\sqrt2}2'], 4: ['\\frac{\\sqrt3}2', '\\frac12'], 6: ['1', '0'],
  };
  const TANEX = { 0: '0', 2: '\\frac{\\sqrt3}3', 3: '1', 4: '\\sqrt3', 6: '\\text{undefined}' };
  function angleTex(k) { // k * pi/12
    if (k === 0) return '0';
    const r = U.reduce(k, 12);
    const num = r.n === 1 ? '' : r.n;
    return r.d === 1 ? `${num}\\pi` : `\\frac{${num}\\pi}{${r.d}}`;
  }
  W.angleTex = angleTex;
  function exactTrig(k) { // returns {sin, cos, tan} tex or null if not special
    k = ((k % 24) + 24) % 24;
    const q = Math.floor(k / 6), rem = k % 6;
    const ref = q % 2 === 0 ? rem : 6 - rem; // reference angle in pi/12 units within [0,6]
    if (!(ref in EX)) return null;
    const sx = Math.cos((k * Math.PI) / 12), sy = Math.sin((k * Math.PI) / 12);
    const sgn = (v, s) => (s === '0' ? '0' : (v < -1e-9 ? '-' : '') + s);
    const [s, c] = EX[ref];
    let t = TANEX[ref];
    if (t !== '\\text{undefined}') t = sgn(sy * sx, t);
    return { sin: sgn(sy, s), cos: sgn(sx, c), tan: t };
  }
  W.exactTrig = exactTrig;
  W.unitcircle = function () {
    const st = { k: 2 };
    const cv = canvas('2.15'); const g = new Graph(cv, {});
    const ro = h('div', { class: 'readout' });
    const draw = () => {
      g.resize();
      // left: unit circle region [-1.4,1.4]; right: wave from 1.6 .. 1.6+2pi*0.45
      const halfH = 1.35; const ratio = g.w / g.h;
      g.setView({ xmin: -1.45, xmax: -1.45 + 2 * halfH * ratio, ymin: -halfH, ymax: halfH, xstep: 0.5, ystep: 0.5 });
      const th = (st.k * Math.PI) / 12, cx = Math.cos(th), sy = Math.sin(th);
      g.clear();
      // custom light axes
      g.line(-1.4, 0, 1.4, 0, { color: 'rgba(255,255,255,0.35)', width: 1 });
      g.line(0, -1.3, 0, 1.3, { color: 'rgba(255,255,255,0.35)', width: 1 });
      g.circle(0, 0, 1, { color: 'rgba(255,255,255,0.55)', width: 1.5 });
      for (let k = 0; k < 24; k++) {
        const ex = exactTrig(k); const t = (k * Math.PI) / 12;
        if (ex) g.point(Math.cos(t), Math.sin(t), { r: 2.5, color: 'rgba(255,255,255,0.55)' });
      }
      // angle arc
      g.param((t) => 0.22 * Math.cos(t), (t) => 0.22 * Math.sin(t), 0, th || 0.0001, { color: '#b48cf2', width: 1.6 });
      g.line(0, 0, cx, sy, { color: '#e8ecf6', width: 1.6 });
      g.line(cx, 0, cx, sy, { color: '#ef6f6c', width: 2.6 }); // sin
      g.line(0, 0, cx, 0, { color: '#5ec8f2', width: 2.6 }); // cos
      g.point(cx, sy, { r: 6 });
      // sine wave to the right
      const x0 = 1.65, scale = (g.view.xmax - x0 - 0.05) / (2 * Math.PI);
      g.line(x0, 0, x0 + 2 * Math.PI * scale, 0, { color: 'rgba(255,255,255,0.3)', width: 1 });
      g.fn((x) => Math.sin((x - x0) / scale), { xmin: x0, xmax: x0 + 2 * Math.PI * scale, color: 'rgba(239,111,108,0.5)', width: 1.6 });
      g.fn((x) => Math.cos((x - x0) / scale), { xmin: x0, xmax: x0 + 2 * Math.PI * scale, color: 'rgba(94,200,242,0.4)', width: 1.4 });
      g.line(cx, sy, x0 + th * scale, sy, { color: 'rgba(239,111,108,0.4)', dash: [3, 4], width: 1 });
      g.point(x0 + th * scale, sy, { color: '#ef6f6c', r: 5 });
      g.text(x0 + 2 * Math.PI * scale, 0, '2π', { dx: -14, dy: 16, color: 'rgba(255,255,255,0.6)', font: '11px monospace' });
      const ex = exactTrig(st.k);
      const deg = st.k * 15;
      const quad = st.k % 6 === 0 ? 'on an axis' : 'Quadrant ' + ['I', 'II', 'III', 'IV'][Math.floor(st.k / 6)];
      ro.innerHTML = `<div class="big">${tex(`\\theta = ${angleTex(st.k)}`)} <span class="muted">= ${deg}°</span></div>` +
        `<div class="small muted">${quad}${st.k % 6 ? ' &middot; reference angle ' + tex(angleTex(Math.floor(st.k / 6) % 2 === 0 ? st.k % 6 : 6 - (st.k % 6))) : ''}</div>` +
        (ex
          ? `<div class="trigvals"><div><span class="cs">sin</span> ${tex('\\displaystyle ' + ex.sin)}</div><div><span class="cc">cos</span> ${tex('\\displaystyle ' + ex.cos)}</div><div><span>tan</span> ${tex('\\displaystyle ' + ex.tan)}</div></div>`
          : `<div class="trigvals"><div><span class="cs">sin</span> ${f2(sy)}</div><div><span class="cc">cos</span> ${f2(cx)}</div><div><span>tan</span> ${f2(sy / cx)}</div></div><div class="small muted">Not a standard angle (decimal values).</div>`) +
        `<div class="small muted">Point = ${tex('(\\cos\\theta, \\sin\\theta)')}. Red = sin (height), blue = cos (horizontal).</div>`;
    };
    const sl = slider('$\\theta$', 0, 23, 1, st.k, (v) => { st.k = v; draw(); }, (v) => v * 15 + '°');
    cv.addEventListener('click', (e) => {
      const r = cv.getBoundingClientRect();
      const x = g.view.xmin + ((e.clientX - r.left) / r.width) * (g.view.xmax - g.view.xmin);
      const y = g.view.ymax - ((e.clientY - r.top) / r.height) * (g.view.ymax - g.view.ymin);
      if (x > 1.5) return;
      let a = Math.atan2(y, x); if (a < 0) a += 2 * Math.PI;
      st.k = Math.round(a / (Math.PI / 12)) % 24; sl.set(st.k); draw();
    });
    const quiz = h('button', { class: 'btn small', onclick: () => {
      const specials = [...Array(24).keys()].filter((k) => exactTrig(k));
      st.k = U.pick(specials); sl.set(st.k);
      // hide values until revealed
      draw(); ro.querySelector('.trigvals').classList.add('blur');
      ro.querySelector('.trigvals').addEventListener('click', (ev) => ev.currentTarget.classList.remove('blur'), { once: true });
    } }, 'Quiz me: random angle (click values to reveal)');
    const controls = h('div', { class: 'controls' }, sl, quiz);
    mount(draw);
    return frame('Unit circle explorer', controls, cv, ro, 'Click anywhere on the circle to jump to the nearest 15° angle. Gray dots mark the 16 standard angles.', true);
  };

  /* ---------- 7. Trig graph ---------- */
  W.triggraph = function () {
    const st = { f: 'sin', A: 1, B: 1, C: 0, D: 0 };
    const cv = canvas(); const g = new Graph(cv, { xmin: -2 * Math.PI, xmax: 2 * Math.PI, ymin: -4, ymax: 4, piTicks: true });
    const ro = h('div', { class: 'readout' });
    const FN = { sin: Math.sin, cos: Math.cos, tan: Math.tan };
    const draw = () => {
      const f = FN[st.f];
      g.clear().axes();
      g.fn(f, { color: 'rgba(255,255,255,0.3)', dash: [5, 5], width: 1.4 });
      g.fn((x) => st.A * f(st.B * (x - st.C)) + st.D);
      if (st.f !== 'tan') { g.hline(st.D, { color: 'rgba(94,200,242,0.5)' }); }
      const period = (st.f === 'tan' ? Math.PI : 2 * Math.PI) / Math.abs(st.B);
      ro.innerHTML = `<div>${tex(`y = ${coef(st.A)}\\${st.f}\\left(${argTex(st.B, +st.C.toFixed(4))}\\right)${plus(st.D)}`)}</div>` +
        `<ul class="tight small">${st.f !== 'tan' ? `<li>amplitude ${tex('|A| = ' + Math.abs(st.A))}</li>` : ''}` +
        `<li>period ${tex(`\\frac{${st.f === 'tan' ? '\\pi' : '2\\pi'}}{|B|} = ${f2(period)}`)}</li>` +
        `<li>phase shift ${tex('C = ' + f2(st.C))}</li><li>midline ${tex('y = ' + st.D)}</li></ul>`;
    };
    const controls = h('div', { class: 'controls' },
      h('label', { class: 'slider' }, h('span', { class: 'slabel' }, 'function'), select([['sin', 'sin'], ['cos', 'cos'], ['tan', 'tan']], 'sin', (v) => { st.f = v; draw(); })),
      slider('$A$', -3, 3, 0.5, 1, (v) => { st.A = v; draw(); }),
      slider('$B$', 0.5, 4, 0.5, 1, (v) => { st.B = v; draw(); }),
      slider('$C$', -3.14, 3.14, Math.PI / 12, 0, (v) => { st.C = v; draw(); }, (v) => (Math.abs(v) < 1e-6 ? '0' : f2(v))),
      slider('$D$', -2, 2, 0.5, 0, (v) => { st.D = v; draw(); }));
    mount(draw);
    return frame('Trig graphs: $y = A\\sin(B(x-C)) + D$', controls, cv, ro);
  };

  /* ---------- 8. Riemann sums ---------- */
  const RF = { 'x^2 on [0,1]': [(x) => x * x, 0, 1, 1 / 3, 'x^2'], 'sqrt(x) on [0,4]': [Math.sqrt, 0, 4, 16 / 3, '\\sqrt x'], 'sin x on [0,π]': [Math.sin, 0, Math.PI, 2, '\\sin x'], '1/x on [1,e]': [(x) => 1 / x, 1, Math.E, 1, '\\tfrac1x'] };
  W.riemann = function () {
    const st = { f: 'x^2 on [0,1]', n: 6, m: 'right' };
    const cv = canvas(); const g = new Graph(cv, {});
    const ro = h('div', { class: 'readout' });
    const draw = () => {
      const [f, a, b, exact, ft] = RF[st.f];
      const pad = (b - a) * 0.12;
      let ymax = 0; for (let i = 0; i <= 100; i++) ymax = Math.max(ymax, f(a + ((b - a) * i) / 100));
      g.setView({ xmin: a - pad, xmax: b + pad, ymin: -ymax * 0.15, ymax: ymax * 1.25, xstep: null, ystep: null });
      g.clear().axes();
      const dx = (b - a) / st.n; let S = 0;
      for (let i = 0; i < st.n; i++) {
        const xl = a + i * dx; const xs = st.m === 'left' ? xl : st.m === 'right' ? xl + dx : xl + dx / 2;
        const y = f(xs); S += y * dx; g.rect(xl, 0, dx, y);
      }
      g.fn(f, { xmin: a, xmax: b });
      ro.innerHTML = `<div>${tex(`\\sum_{i=1}^{${st.n}} f(x_i)\\,\\Delta x \\approx ${S.toFixed(5)}`)}</div>` +
        `<div>${tex(`\\int_{${a === 0 ? 0 : a}}^{${st.f.includes('π') ? '\\pi' : st.f.includes('e]') ? 'e' : b}} ${ft}\\,dx = ${f2(exact)}`)}</div>` +
        `<div class="small muted">error ${tex(`= ${(S - exact).toExponential(2)}`)} &middot; ${tex(`\\Delta x = \\frac{b-a}{n} = ${dx.toFixed(4)}`)}</div>`;
    };
    const controls = h('div', { class: 'controls' },
      h('label', { class: 'slider' }, h('span', { class: 'slabel' }, 'function'), select(Object.keys(RF).map((k) => [k, k]), st.f, (v) => { st.f = v; draw(); })),
      h('label', { class: 'slider' }, h('span', { class: 'slabel' }, 'sample'), select([['left', 'left endpoints'], ['right', 'right endpoints'], ['mid', 'midpoints']], 'right', (v) => { st.m = v; draw(); })),
      slider('$n$', 1, 100, 1, st.n, (v) => { st.n = v; draw(); }));
    mount(draw);
    return frame('Riemann sums → the integral', controls, cv, ro, 'Increase $n$: the sum of rectangle areas converges to the exact area. That limit is the definite integral.');
  };

  /* ---------- 9. Polar ---------- */
  W.polar = function () {
    const st = { type: 'cos', a: 1, b: 1, n: 1, tmax: 2 };
    const cv = canvas('1.25'); const g = new Graph(cv, {});
    const ro = h('div', { class: 'readout' });
    const draw = () => {
      g.resize(); g.square(0, 0, 3.4);
      g.view.xstep = 1; g.view.ystep = 1;
      g.clear().axes();
      const T = (st.tmax * Math.PI);
      const r = st.type === 'rose' ? (t) => st.a * 2 * Math.cos(st.n * t) : st.type === 'cos' ? (t) => st.a + st.b * Math.cos(t) : (t) => st.a + st.b * Math.sin(t);
      g.param((t) => r(t) * Math.cos(t), (t) => r(t) * Math.sin(t), 0, T);
      const t = T, rr = r(t);
      g.line(0, 0, rr * Math.cos(t), rr * Math.sin(t), { color: 'rgba(94,200,242,0.7)', width: 1.4 });
      g.point(rr * Math.cos(t), rr * Math.sin(t));
      const eq = st.type === 'rose' ? `r = ${2 * st.a}\\cos(${st.n}\\theta)` : `r = ${st.a} ${signed(st.b)}\\${st.type}\\theta`;
      let name = '';
      if (st.type === 'rose') name = `rose with ${st.n % 2 ? st.n : 2 * st.n} petals`;
      else name = st.a === Math.abs(st.b) ? 'cardioid' : st.a === 0 ? 'circle through the origin' : st.b === 0 ? 'circle' : Math.abs(st.b) > st.a ? 'limaçon with inner loop' : 'dimpled/convex limaçon';
      ro.innerHTML = `<div>${tex(eq)}</div><div class="muted">${name}</div>` +
        `<div class="small">at ${tex('\\theta = ' + f2(t))}: ${tex(`(x,y) = (r\\cos\\theta, r\\sin\\theta) = (${f2(rr * Math.cos(t))}, ${f2(rr * Math.sin(t))})`)}</div>`;
    };
    const controls = h('div', { class: 'controls' },
      h('label', { class: 'slider' }, h('span', { class: 'slabel' }, 'family'), select([['cos', 'a + b cos θ'], ['sin', 'a + b sin θ'], ['rose', 'rose a cos(nθ)']], 'cos', (v) => { st.type = v; draw(); })),
      slider('$a$', 0, 2, 0.5, 1, (v) => { st.a = v; draw(); }),
      slider('$b$', -2, 2, 0.5, 1, (v) => { st.b = v; draw(); }),
      slider('$n$ (rose)', 1, 6, 1, 1, (v) => { st.n = v; draw(); }),
      slider('trace $\\theta$ to', 0.05, 2, 0.05, 2, (v) => { st.tmax = v; draw(); }, (v) => f2(v) + 'π'));
    mount(draw);
    return frame('Polar curves', controls, cv, ro, 'Drag "trace θ" from 0 to see how the curve is drawn as θ sweeps around.');
  };

  /* ---------- 10. Secant → tangent ---------- */
  W.secant = function () {
    const st = { c: 'x^2', a: 1, h: 2 };
    const cv = canvas(); const g = new Graph(cv, { xmin: -4, xmax: 5, ymin: -3, ymax: 8 });
    const ro = h('div', { class: 'readout' });
    const draw = () => {
      const [f, df, ft] = CURVES[st.c];
      const a = st.a, hh = st.h, fa = f(a), fb = f(a + hh);
      g.clear().axes().fn(f);
      if (!isFinite(fa)) { ro.innerHTML = 'Choose a in the domain.'; return; }
      const m = (fb - fa) / hh;
      g.fn((x) => fa + df(a) * (x - a), { color: 'rgba(180,140,242,0.6)', dash: [6, 5], width: 1.5 });
      if (isFinite(m)) { g.fn((x) => fa + m * (x - a), { color: '#5ec8f2', width: 2 }); g.point(a + hh, fb, { color: '#5ec8f2' }); }
      g.point(a, fa);
      ro.innerHTML = `<div>${tex(`f(x)=${ft},\\ a = ${f2(a)},\\ h = ${hh}`)}</div>` +
        `<div class="hl">${tex(`m_{\\text{sec}} = \\frac{f(a+h)-f(a)}{h} = ${isFinite(m) ? m.toFixed(5) : '\\text{undef}'}`)}</div>` +
        `<div>${tex(`m_{\\text{tan}} = f'(${f2(a)}) = ${df(a).toFixed(5)}`)}</div>` +
        `<div class="small muted">gap ${tex(`= ${isFinite(m) ? Math.abs(m - df(a)).toExponential(2) : '—'}`)} &middot; purple dashed = tangent line</div>`;
    };
    const hs = slider('$h$', -2, 3, 0.01, st.h, (v) => { st.h = Math.abs(v) < 0.005 ? 0.005 : +v.toFixed(3); draw(); });
    const anim = h('button', { class: 'btn small', onclick: () => {
      let v = 3; const id = setInterval(() => { v *= 0.88; if (v < 0.006) { v = 0.005; clearInterval(id); } st.h = +v.toFixed(4); hs.set(st.h); draw(); }, 60);
    } }, '▶ Animate h → 0');
    const controls = h('div', { class: 'controls' },
      h('label', { class: 'slider' }, h('span', { class: 'slabel' }, 'curve'), select(Object.keys(CURVES).map((k) => [k, k]), st.c, (v) => { st.c = v; draw(); })),
      slider('$a$', -2, 3, 0.25, 1, (v) => { st.a = v; draw(); }), hs, anim);
    mount(draw);
    return frame('Secant line → tangent line', controls, cv, ro, 'As $h \\to 0$ the secant slope converges to the tangent slope. That limit is the derivative.');
  };

  global.Widgets = W;
})(window);
