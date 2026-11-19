/* Minimal canvas plotter with axes, functions (with asymptote breaks), points, lines, shading. */
(function (global) {
  function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  class Graph {
    constructor(canvas, view) {
      this.c = canvas;
      this.ctx = canvas.getContext('2d');
      this.view = Object.assign({ xmin: -10, xmax: 10, ymin: -7, ymax: 7, xstep: null, ystep: null, piTicks: false }, view || {});
      this.resize();
    }
    resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.c.getBoundingClientRect();
      const w = rect.width || this.c.width || 600;
      const h = rect.height || w * 0.62;
      this.c.width = Math.round(w * dpr);
      this.c.height = Math.round(h * dpr);
      this.w = w; this.h = h;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    setView(v) { Object.assign(this.view, v); }
    X(x) { const v = this.view; return ((x - v.xmin) / (v.xmax - v.xmin)) * this.w; }
    Y(y) { const v = this.view; return this.h - ((y - v.ymin) / (v.ymax - v.ymin)) * this.h; }

    clear() {
      this.resize();
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      ctx.fillStyle = cssVar('--graph-bg', '#0f1424');
      ctx.fillRect(0, 0, this.w, this.h);
      return this;
    }
    niceStep(range, px) {
      const target = range / Math.max(4, px / 70);
      const p = Math.pow(10, Math.floor(Math.log10(target)));
      const m = target / p;
      return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
    }
    axes() {
      const ctx = this.ctx, v = this.view;
      const grid = cssVar('--graph-grid', 'rgba(255,255,255,0.06)');
      const axis = cssVar('--graph-axis', 'rgba(255,255,255,0.45)');
      const label = cssVar('--graph-label', 'rgba(255,255,255,0.55)');
      let xs = v.xstep || (v.piTicks ? Math.PI / 2 : this.niceStep(v.xmax - v.xmin, this.w));
      const ys = v.ystep || this.niceStep(v.ymax - v.ymin, this.h);
      ctx.lineWidth = 1;
      ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillStyle = label;
      // grid
      ctx.strokeStyle = grid;
      ctx.beginPath();
      for (let x = Math.ceil(v.xmin / xs) * xs; x <= v.xmax + 1e-9; x += xs) { ctx.moveTo(this.X(x), 0); ctx.lineTo(this.X(x), this.h); }
      for (let y = Math.ceil(v.ymin / ys) * ys; y <= v.ymax + 1e-9; y += ys) { ctx.moveTo(0, this.Y(y)); ctx.lineTo(this.w, this.Y(y)); }
      ctx.stroke();
      // axes
      ctx.strokeStyle = axis; ctx.lineWidth = 1.3;
      ctx.beginPath();
      if (v.ymin < 0 && v.ymax > 0) { ctx.moveTo(0, this.Y(0)); ctx.lineTo(this.w, this.Y(0)); }
      if (v.xmin < 0 && v.xmax > 0) { ctx.moveTo(this.X(0), 0); ctx.lineTo(this.X(0), this.h); }
      ctx.stroke();
      // labels
      const y0 = Math.min(Math.max(this.Y(0) + 13, 12), this.h - 4);
      const x0 = Math.min(Math.max(this.X(0) + 4, 4), this.w - 30);
      for (let x = Math.ceil(v.xmin / xs) * xs; x <= v.xmax + 1e-9; x += xs) {
        if (Math.abs(x) < 1e-9) continue;
        const txt = v.piTicks ? piLabel(x) : fmt(x);
        ctx.fillText(txt, this.X(x) - ctx.measureText(txt).width / 2, y0);
      }
      for (let y = Math.ceil(v.ymin / ys) * ys; y <= v.ymax + 1e-9; y += ys) {
        if (Math.abs(y) < 1e-9) continue;
        ctx.fillText(fmt(y), x0, this.Y(y) + 4);
      }
      return this;
    }
    fn(f, opt) {
      opt = Object.assign({ color: cssVar('--c1', '#f5b942'), width: 2.4, dash: null, xmin: this.view.xmin, xmax: this.view.xmax }, opt || {});
      const ctx = this.ctx, v = this.view;
      ctx.save();
      ctx.strokeStyle = opt.color; ctx.lineWidth = opt.width;
      ctx.setLineDash(opt.dash || []);
      ctx.beginPath();
      const N = Math.max(400, Math.round(this.w * 2));
      const span = v.ymax - v.ymin;
      let pen = false, prevY = null;
      for (let i = 0; i <= N; i++) {
        const x = opt.xmin + ((opt.xmax - opt.xmin) * i) / N;
        let y;
        try { y = f(x); } catch (e) { y = NaN; }
        if (!isFinite(y) || Math.abs(y) > 1e6) { pen = false; prevY = null; continue; }
        if (prevY !== null && Math.abs(y - prevY) > span * 1.5) pen = false; // asymptote jump
        const px = this.X(x), py = Math.max(-1e4, Math.min(1e4, this.Y(y)));
        if (pen) ctx.lineTo(px, py); else ctx.moveTo(px, py);
        pen = true; prevY = y;
      }
      ctx.stroke();
      ctx.restore();
      return this;
    }
    param(fx, fy, t0, t1, opt) {
      opt = Object.assign({ color: cssVar('--c1', '#f5b942'), width: 2.4, steps: 1200 }, opt || {});
      const ctx = this.ctx;
      ctx.save(); ctx.strokeStyle = opt.color; ctx.lineWidth = opt.width; ctx.setLineDash(opt.dash || []);
      ctx.beginPath();
      let pen = false;
      for (let i = 0; i <= opt.steps; i++) {
        const t = t0 + ((t1 - t0) * i) / opt.steps;
        const x = fx(t), y = fy(t);
        if (!isFinite(x) || !isFinite(y)) { pen = false; continue; }
        if (pen) ctx.lineTo(this.X(x), this.Y(y)); else ctx.moveTo(this.X(x), this.Y(y));
        pen = true;
      }
      ctx.stroke(); ctx.restore();
      return this;
    }
    line(x1, y1, x2, y2, opt) {
      opt = Object.assign({ color: cssVar('--c2', '#5ec8f2'), width: 1.8, dash: null }, opt || {});
      const ctx = this.ctx;
      ctx.save(); ctx.strokeStyle = opt.color; ctx.lineWidth = opt.width; ctx.setLineDash(opt.dash || []);
      ctx.beginPath(); ctx.moveTo(this.X(x1), this.Y(y1)); ctx.lineTo(this.X(x2), this.Y(y2)); ctx.stroke();
      ctx.restore(); return this;
    }
    vline(x, opt) { return this.line(x, this.view.ymin - 1, x, this.view.ymax + 1, Object.assign({ dash: [6, 5], color: cssVar('--c3', '#ef6f6c') }, opt)); }
    hline(y, opt) { return this.line(this.view.xmin - 1, y, this.view.xmax + 1, y, Object.assign({ dash: [6, 5], color: cssVar('--c3', '#ef6f6c') }, opt)); }
    point(x, y, opt) {
      opt = Object.assign({ color: cssVar('--c1', '#f5b942'), r: 5, hollow: false }, opt || {});
      const ctx = this.ctx;
      ctx.save(); ctx.beginPath(); ctx.arc(this.X(x), this.Y(y), opt.r, 0, Math.PI * 2);
      if (opt.hollow) { ctx.fillStyle = cssVar('--graph-bg', '#0f1424'); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = opt.color; ctx.stroke(); }
      else { ctx.fillStyle = opt.color; ctx.fill(); }
      ctx.restore(); return this;
    }
    rect(x, y, w, h, opt) {
      opt = Object.assign({ fill: 'rgba(94,200,242,0.22)', stroke: 'rgba(94,200,242,0.7)' }, opt || {});
      const ctx = this.ctx;
      const X1 = this.X(x), X2 = this.X(x + w), Y1 = this.Y(y), Y2 = this.Y(y + h);
      ctx.save(); ctx.fillStyle = opt.fill; ctx.strokeStyle = opt.stroke; ctx.lineWidth = 1;
      ctx.fillRect(Math.min(X1, X2), Math.min(Y1, Y2), Math.abs(X2 - X1), Math.abs(Y2 - Y1));
      ctx.strokeRect(Math.min(X1, X2), Math.min(Y1, Y2), Math.abs(X2 - X1), Math.abs(Y2 - Y1));
      ctx.restore(); return this;
    }
    text(x, y, str, opt) {
      opt = Object.assign({ color: cssVar('--text', '#e8ecf6'), font: '13px Inter, system-ui, sans-serif', dx: 6, dy: -6 }, opt || {});
      const ctx = this.ctx; ctx.save(); ctx.fillStyle = opt.color; ctx.font = opt.font;
      ctx.fillText(str, this.X(x) + opt.dx, this.Y(y) + opt.dy); ctx.restore(); return this;
    }
    circle(cx, cy, r, opt) {
      return this.param((t) => cx + r * Math.cos(t), (t) => cy + r * Math.sin(t), 0, 2 * Math.PI, opt);
    }
    // keep aspect ratio 1:1 around a center
    square(cx, cy, halfWidth) {
      this.resize();
      const ratio = this.h / this.w;
      this.view.xmin = cx - halfWidth; this.view.xmax = cx + halfWidth;
      this.view.ymin = cy - halfWidth * ratio; this.view.ymax = cy + halfWidth * ratio;
      return this;
    }
  }

  function fmt(n) {
    if (Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0)) return n.toExponential(0);
    return String(+n.toFixed(2));
  }
  function piLabel(x) {
    const k = Math.round((x / Math.PI) * 2); // multiples of pi/2
    if (k === 0) return '0';
    if (k % 2 === 0) { const m = k / 2; return (m === 1 ? '' : m === -1 ? '-' : m) + 'π'; }
    return (k === 1 ? '' : k === -1 ? '-' : k) + 'π/2';
  }

  global.Graph = Graph;
})(window);
