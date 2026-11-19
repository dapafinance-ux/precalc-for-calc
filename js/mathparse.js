/* Safe math expression parser + evaluator (no eval).
   Supports: + - * / ^, parentheses, implicit multiplication (2x, 3pi, 2(x+1), (x+1)(x-1)),
   constants pi/π, e; functions sqrt/√, cbrt, sin cos tan sec csc cot, asin acos atan (arcsin...),
   ln, log (base 10), log2, exp, abs; factorial n!; variables (single letters / named). */
(function (global) {
  const FUNCS = {
    sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, exp: Math.exp,
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    sec: (x) => 1 / Math.cos(x), csc: (x) => 1 / Math.sin(x), cot: (x) => 1 / Math.tan(x),
    asin: Math.asin, acos: Math.acos, atan: Math.atan,
    arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
    ln: Math.log, log: Math.log10, log10: Math.log10, log2: Math.log2,
  };
  const CONSTS = { pi: Math.PI, e: Math.E };

  function tokenize(src) {
    const s = String(src)
      .replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/[−–]/g, '-')
      .replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/\*\*/g, '^');
    const toks = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
        const txt = s.slice(i, j);
        if ((txt.match(/\./g) || []).length > 1) throw new Error('Bad number: ' + txt);
        toks.push({ t: 'num', v: parseFloat(txt) }); i = j; continue;
      }
      if (/[a-zA-Z]/.test(c)) {
        let j = i; while (j < s.length && /[a-zA-Z0-9]/.test(s[j])) j++;
        let word = s.slice(i, j).toLowerCase();
        // split words greedily into known function/const names or single-letter vars
        splitWord(word).forEach((w) => toks.push(w));
        i = j; continue;
      }
      if ('+-*/^()!,'.includes(c)) { toks.push({ t: 'op', v: c }); i++; continue; }
      throw new Error('Unexpected character: ' + c);
    }
    return toks;
  }

  const NAMES = Object.keys(FUNCS).concat(Object.keys(CONSTS)).sort((a, b) => b.length - a.length);
  function splitWord(word) {
    const out = [];
    let k = 0;
    while (k < word.length) {
      // digits embedded (e.g. log2 handled as name, x2 -> x*2)
      let matched = null;
      for (const n of NAMES) { if (word.startsWith(n, k)) { matched = n; break; } }
      if (matched) {
        out.push(FUNCS[matched] ? { t: 'fn', v: matched } : { t: 'const', v: matched });
        k += matched.length; continue;
      }
      const ch = word[k];
      if (/[0-9]/.test(ch)) {
        let j = k; while (j < word.length && /[0-9]/.test(word[j])) j++;
        out.push({ t: 'num', v: parseFloat(word.slice(k, j)) }); k = j; continue;
      }
      out.push({ t: 'var', v: ch }); k++;
    }
    return out;
  }

  function parse(src) {
    const toks = tokenize(src);
    let p = 0;
    const peek = () => toks[p];
    const isOp = (v) => peek() && peek().t === 'op' && peek().v === v;
    const eat = (v) => { if (!isOp(v)) throw new Error('Expected ' + v); p++; };

    function expr() {
      let node = term();
      while (isOp('+') || isOp('-')) {
        const op = toks[p++].v; const r = term(); const l = node;
        node = op === '+' ? (s) => l(s) + r(s) : (s) => l(s) - r(s);
      }
      return node;
    }
    function startsPrimary() {
      const t = peek(); if (!t) return false;
      return t.t === 'num' || t.t === 'var' || t.t === 'const' || t.t === 'fn' || (t.t === 'op' && t.v === '(');
    }
    function term() {
      let node = unary();
      for (;;) {
        if (isOp('*') || isOp('/')) {
          const op = toks[p++].v; const r = unary(); const l = node;
          node = op === '*' ? (s) => l(s) * r(s) : (s) => l(s) / r(s);
        } else if (startsPrimary()) {
          const r = power(); const l = node; node = (s) => l(s) * r(s);
        } else break;
      }
      return node;
    }
    function unary() {
      if (isOp('-')) { p++; const u = unary(); return (s) => -u(s); }
      if (isOp('+')) { p++; return unary(); }
      return power();
    }
    function power() {
      const base = postfix();
      if (isOp('^')) { p++; const ex = unary(); return (s) => Math.pow(base(s), ex(s)); }
      return base;
    }
    function postfix() {
      let node = primary();
      while (isOp('!')) { p++; const n = node; node = (s) => fact(n(s)); }
      return node;
    }
    function primary() {
      const t = peek();
      if (!t) throw new Error('Unexpected end of input');
      if (t.t === 'num') { p++; const v = t.v; return () => v; }
      if (t.t === 'const') { p++; const v = CONSTS[t.v]; return () => v; }
      if (t.t === 'var') { p++; const name = t.v; return (s) => { if (!(name in s)) throw new Error('Unknown variable ' + name); return s[name]; }; }
      if (t.t === 'fn') {
        p++; const f = FUNCS[t.v];
        // allow sin^2(x) style
        let pw = null;
        if (isOp('^')) { p++; pw = unary(); }
        let arg;
        if (isOp('(')) { eat('('); arg = expr(); eat(')'); } else { arg = power(); } // sqrt3, sin x
        return pw ? (s) => Math.pow(f(arg(s)), pw(s)) : (s) => f(arg(s));
      }
      if (t.t === 'op' && t.v === '(') { eat('('); const e = expr(); eat(')'); return e; }
      throw new Error('Unexpected token ' + t.v);
    }
    const root = expr();
    if (p < toks.length) throw new Error('Unexpected token ' + toks[p].v);
    return root;
  }

  function fact(n) {
    if (n < 0 || Math.abs(n - Math.round(n)) > 1e-9) return NaN;
    let r = 1; for (let i = 2; i <= Math.round(n); i++) r *= i; return r;
  }

  function evaluate(src, scope) { return parse(src)(scope || {}); }

  const UNDEF_WORDS = ['undefined', 'dne', 'none', 'und', 'doesnotexist', 'does not exist', 'no solution', 'nosolution'];
  function isUndefWord(s) { return UNDEF_WORDS.includes(String(s).trim().toLowerCase().replace(/\s+/g, ' ')); }

  function close(a, b) {
    if (!isFinite(a) || !isFinite(b)) return false;
    // exact forms match to ~1e-9; decimals must be correct to ~3 significant decimals
    return Math.abs(a - b) <= 1e-3 * Math.max(1, Math.abs(b));
  }

  /* expected: number, or null meaning "undefined / DNE" */
  function checkNumber(input, expected) {
    if (expected === null) return isUndefWord(input);
    if (isUndefWord(input)) return false;
    try { return close(evaluate(input), expected); } catch (e) { return false; }
  }

  /* expected: function(scope)->number; vars: ['x','h']; domain sampler optional */
  function checkExpression(input, expectedFn, vars, sampler) {
    let f;
    try { f = parse(input); } catch (e) { return false; }
    let good = 0;
    for (let i = 0; i < 40 && good < 8; i++) {
      const scope = {};
      vars.forEach((v) => { scope[v] = sampler ? sampler(v) : (Math.random() * 6 - 3); });
      let want, got;
      try { want = expectedFn(scope); got = f(scope); } catch (e) { return false; }
      if (!isFinite(want)) continue;
      if (!close(got, want)) return false;
      good++;
    }
    return good >= 4;
  }

  function splitList(input) {
    return String(input).split(/[;,]|\band\b|\bor\b/).map((s) => s.trim()).filter(Boolean);
  }
  /* order-insensitive list of numbers */
  function checkList(input, expectedArr) {
    const parts = splitList(input);
    if (parts.length !== expectedArr.length) return false;
    const vals = [];
    for (const p of parts) { try { vals.push(evaluate(p.replace(/^[a-z]\s*=\s*/i, ''))); } catch (e) { return false; } }
    const used = new Array(vals.length).fill(false);
    return expectedArr.every((exp) => {
      const idx = vals.findIndex((v, i) => !used[i] && close(v, exp));
      if (idx < 0) return false; used[idx] = true; return true;
    });
  }

  global.MathParse = { parse, evaluate, checkNumber, checkExpression, checkList, isUndefWord, close };
  if (typeof module !== 'undefined') module.exports = global.MathParse;
})(typeof window !== 'undefined' ? window : globalThis);
