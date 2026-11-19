/* Shared helpers: randomness, formatting, rendering, persistence. */
(function (global) {
  const U = {};

  U.ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  U.riNZ = (a, b) => { let v; do { v = U.ri(a, b); } while (v === 0); return v; };
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  U.gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };

  /* reduced fraction -> {n,d} */
  U.reduce = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = U.gcd(n, d); return { n: n / g, d: d / g }; };
  U.fracTex = (n, d) => {
    const r = U.reduce(n, d);
    if (r.d === 1) return String(r.n);
    return (r.n < 0 ? '-' : '') + `\\frac{${Math.abs(r.n)}}{${r.d}}`;
  };
  U.fracStr = (n, d) => { const r = U.reduce(n, d); return r.d === 1 ? String(r.n) : `${r.n}/${r.d}`; };

  /* signed term helpers for building LaTeX */
  U.sgn = (c, first) => (c < 0 ? '-' : first ? '' : '+');
  /* polynomial from coefficient array [a_n, ..., a_0] */
  U.polyTex = (coeffs, v = 'x') => {
    const n = coeffs.length - 1; let out = ''; let first = true;
    coeffs.forEach((c, i) => {
      const p = n - i; if (c === 0) return;
      const abs = Math.abs(c);
      const coef = abs === 1 && p !== 0 ? '' : String(abs);
      const varPart = p === 0 ? '' : p === 1 ? v : `${v}^{${p}}`;
      out += (first ? (c < 0 ? '-' : '') : (c < 0 ? ' - ' : ' + ')) + coef + varPart;
      first = false;
    });
    return out || '0';
  };
  /* (x - r) written nicely */
  U.lin = (r, v = 'x') => (r === 0 ? v : r > 0 ? `${v} - ${r}` : `${v} + ${-r}`);
  U.num = (x, d = 4) => String(+x.toFixed(d));

  /* DOM */
  U.h = (tag, attrs, ...kids) => {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'html') el.innerHTML = attrs[k];
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), attrs[k]);
      else el.setAttribute(k, attrs[k]);
    }
    kids.flat().forEach((k) => { if (k == null) return; el.appendChild(typeof k === 'string' ? document.createTextNode(k) : k); });
    return el;
  };
  U.tex = (s, display) => {
    try { return katex.renderToString(s, { displayMode: !!display, throwOnError: false }); } catch (e) { return s; }
  };
  U.renderMath = (el) => {
    if (!global.renderMathInElement) return;
    renderMathInElement(el, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
        { left: '$', right: '$', display: false },
      ],
      throwOnError: false,
    });
  };

  /* Persistence */
  const KEY = 'pc2c.v1';
  const blank = () => ({ stats: {}, cards: {}, streak: { last: null, count: 0 }, best: {} });
  let state;
  try { state = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { state = blank(); }
  U.store = {
    get: () => state,
    save: () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ } },
    reset: () => { state = blank(); U.store.save(); },
    record(moduleId, correct) {
      const s = (state.stats[moduleId] = state.stats[moduleId] || { attempts: 0, correct: 0, recent: [] });
      s.attempts++; if (correct) s.correct++;
      s.recent.push(correct ? 1 : 0); if (s.recent.length > 20) s.recent.shift();
      U.store.touchStreak();
      U.store.save();
    },
    mastery(moduleId) {
      const s = state.stats[moduleId];
      if (!s || !s.recent.length) return { pct: 0, n: 0, label: 'Not started' };
      const pct = Math.round((100 * s.recent.reduce((a, b) => a + b, 0)) / s.recent.length);
      const n = s.attempts;
      const label = n >= 15 && pct >= 85 ? 'Mastered' : n >= 5 ? 'Practicing' : 'Started';
      return { pct, n, label };
    },
    touchStreak() {
      const today = new Date().toISOString().slice(0, 10);
      const st = state.streak;
      if (st.last === today) return;
      const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      st.count = st.last === y ? st.count + 1 : 1;
      st.last = today;
    },
  };

  global.U = U;
})(window);
