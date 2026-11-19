/* Randomized practice problem generators with worked solutions.
   Each generator returns { q, type, ...answerSpec, sol, hint }.
   types: num {answer:number|null}, expr {fn, vars}, list {answer:[]}, mc {choices, correct}, multi {fields:[{label, answer}]} */
(function (global) {
  const { ri, riNZ, pick, shuffle, fracTex, lin, polyTex, reduce } = U;
  const T = (s) => `$${s}$`;
  const sq = (n) => n * n;
  const sgnTerm = (c, v = '') => (c === 0 ? '' : (c > 0 ? ' + ' : ' - ') + (Math.abs(c) === 1 && v ? '' : Math.abs(c)) + v);
  const angleTex = (k) => Widgets.angleTex(k);
  const exactTrig = (k) => Widgets.exactTrig(k);
  const SPECIAL_K = [...Array(24).keys()].filter((k) => k % 2 === 0 || k % 3 === 0);
  function mc(q, correctHtml, wrongs, sol, hint) {
    const choices = shuffle([correctHtml, ...wrongs.filter((w) => w !== correctHtml).slice(0, 3)]);
    return { q, type: 'mc', choices, correct: choices.indexOf(correctHtml), sol, hint };
  }

  const G = {};

  /* ======================= 1. ALGEBRA ======================= */
  G.algebra = [
    function exponentRules() {
      const m = riNZ(-4, 6), n = riNZ(-3, 5), p = ri(2, 3), q = riNZ(-5, 7);
      const k = (m + n) * p - q;
      return {
        q: `Simplify to the form ${T('x^k')} and enter ${T('k')}: $$\\frac{\\left(x^{${m}}\\cdot x^{${n}}\\right)^{${p}}}{x^{${q}}}$$`,
        type: 'num', answer: k,
        hint: 'Add exponents when multiplying, multiply for a power of a power, subtract when dividing.',
        sol: `$$\\left(x^{${m + n}}\\right)^{${p}} = x^{${(m + n) * p}},\\qquad \\frac{x^{${(m + n) * p}}}{x^{${q}}} = x^{${(m + n) * p} - (${q})} = x^{${k}}$$`,
      };
    },
    function radicalToPower() {
      const n = pick([2, 3, 4, 5]); let m = ri(1, 7); if (m % n === 0) m++;
      const c = ri(2, 9);
      const root = n === 2 ? `\\sqrt{x^{${m}}}` : `\\sqrt[${n}]{x^{${m}}}`;
      return {
        q: `Rewrite as ${T('c\\,x^k')} (the form the power rule needs). Enter ${T('k')} (a fraction like -3/2 is fine): $$\\frac{${c}}{${root}}$$`,
        type: 'num', answer: -m / n,
        hint: 'A root is a fractional exponent; being in the denominator makes the exponent negative.',
        sol: `$$${root} = x^{${m}/${n}} \\Rightarrow \\frac{${c}}{x^{${m}/${n}}} = ${c}x^{${fracTex(-m, n)}}$$ So ${T('k = ' + fracTex(-m, n))}.`,
      };
    },
    function factorZeros() {
      let r1 = riNZ(-9, 9), r2 = riNZ(-9, 9); if (r1 === r2) r2 = -r2 || 3;
      const b = -(r1 + r2), c = r1 * r2;
      return {
        q: `Factor and find all zeros (comma-separated): $$x^2${sgnTerm(b, 'x')}${sgnTerm(c)} = 0$$`,
        type: 'list', answer: [r1, r2],
        hint: `Find two numbers that multiply to ${c} and add to ${b}.`,
        sol: `Two numbers with product ${T(c)} and sum ${T(b)}: ${T(-r1)} and ${T(-r2)}. $$(${lin(r1)})(${lin(r2)}) = 0 \\Rightarrow x = ${r1},\\ ${r2}$$`,
      };
    },
    function completeSquare() {
      const hh = riNZ(-6, 6), k = ri(-9, 9);
      const b = -2 * hh, c = hh * hh + k;
      return {
        q: `Complete the square: write $$x^2${sgnTerm(b, 'x')}${sgnTerm(c)}$$ in the form ${T('(x-h)^2 + k')}.`,
        type: 'multi', fields: [{ label: 'h', answer: hh }, { label: 'k', answer: k }],
        hint: 'Half of the x-coefficient, squared, is what you add and subtract.',
        sol: `Half of ${T(b)} is ${T(b / 2)}; squared: ${T(sq(b / 2))}. $$x^2${sgnTerm(b, 'x')} + ${sq(b / 2)} - ${sq(b / 2)}${sgnTerm(c)} = (${lin(hh)})^2${sgnTerm(k) || ' + 0'}$$ So ${T(`h = ${hh},\\ k = ${k}`)}.`,
      };
    },
    function rationalizeLimit() {
      const a = ri(2, 7);
      return {
        q: `Evaluate by rationalizing: $$\\lim_{x\\to 0}\\frac{\\sqrt{x + ${a * a}} - ${a}}{x}$$`,
        type: 'num', answer: 1 / (2 * a),
        hint: 'Multiply top and bottom by the conjugate √(x + a²) + a.',
        sol: `$$\\frac{\\sqrt{x+${a * a}}-${a}}{x}\\cdot\\frac{\\sqrt{x+${a * a}}+${a}}{\\sqrt{x+${a * a}}+${a}} = \\frac{x}{x(\\sqrt{x+${a * a}}+${a})} = \\frac{1}{\\sqrt{x+${a * a}}+${a}} \\to \\frac{1}{${2 * a}}$$`,
      };
    },
    function discriminant() {
      const a = riNZ(-3, 3), b = ri(-8, 8);
      const kind = ri(0, 2);
      let c;
      if (kind === 1 && b % 2 === 0 && (b * b) % (4 * a) === 0) c = (b * b) / (4 * a);
      else c = ri(-9, 9);
      const D = b * b - 4 * a * c;
      const n = D > 0 ? 2 : D === 0 ? 1 : 0;
      const q = `How many real solutions does $$${polyTex([a, b, c])} = 0$$ have?`;
      return mc(q, `${n}`, ['0', '1', '2', 'infinitely many'],
        `${T(`D = b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${D}`)}. ${D > 0 ? 'D > 0 → two real solutions.' : D === 0 ? 'D = 0 → one (double) solution.' : 'D < 0 → no real solutions.'}`,
        'Compute the discriminant b² − 4ac.');
    },
    function signChart() {
      let a = ri(-6, 4), b = a + ri(1, 6);
      const op = pick(['<', '\\le', '>', '\\ge']);
      const inside = op === '<' ? `(${a}, ${b})` : op === '\\le' ? `[${a}, ${b}]` : null;
      const outside = op === '>' ? `(-\\infty, ${a})\\cup(${b}, \\infty)` : op === '\\ge' ? `(-\\infty, ${a}]\\cup[${b}, \\infty)` : null;
      const correct = T(inside || outside);
      const all = [`(${a}, ${b})`, `[${a}, ${b}]`, `(-\\infty, ${a})\\cup(${b}, \\infty)`, `(-\\infty, ${a}]\\cup[${b}, \\infty)`].map(T);
      return mc(`Solve: $$(${lin(a)})(${lin(b)}) ${op} 0$$`, correct, all,
        `Critical numbers ${T(a)}, ${T(b)}. Sign chart: ${T('+')} on ${T(`(-\\infty,${a})`)}, ${T('-')} on ${T(`(${a},${b})`)}, ${T('+')} on ${T(`(${b},\\infty)`)}. ${op.includes('le') || op.includes('ge') ? 'Endpoints included (≤/≥).' : 'Endpoints excluded (strict).'} Answer: ${correct}.`,
        'Mark the zeros on a number line and test one point in each interval.');
    },
    function remainderTheorem() {
      const b = ri(-5, 5), c = ri(-6, 6), d = ri(-9, 9), r = riNZ(-3, 3);
      const val = r ** 3 + b * r * r + c * r + d;
      return {
        q: `Find the remainder when $$p(x) = ${polyTex([1, b, c, d])}$$ is divided by ${T(lin(r))}.`,
        type: 'num', answer: val,
        hint: 'Remainder theorem: the remainder on dividing by (x − r) is p(r).',
        sol: `Remainder ${T(`= p(${r}) = (${r})^3 ${sgnTerm(b)}(${r})^2 ${sgnTerm(c)}(${r}) ${sgnTerm(d)} = ${val}`)}.`,
      };
    },
    function fatalErrors() {
      const S = [
        ['(a+b)^2 = a^2 + b^2', false, 'Missing the cross term: (a+b)² = a² + 2ab + b².'],
        ['\\sqrt{a^2+b^2} = a + b', false, 'Roots do not distribute over addition. Try a=3, b=4: √25 = 5 ≠ 7.'],
        ['\\frac{1}{a+b} = \\frac1a + \\frac1b', false, 'Try a = b = 1: 1/2 ≠ 2.'],
        ['\\frac{x+3}{x} = 3', false, 'You can only cancel factors, not terms. (x+3)/x = 1 + 3/x.'],
        ['\\sqrt{x^2} = |x|', true, 'True: √(x²) is never negative, so it equals |x|.'],
        ['(ab)^2 = a^2b^2', true, 'True: powers distribute over multiplication.'],
        ['-3^2 = 9', false, 'Exponent before negation: −3² = −9. Only (−3)² = 9.'],
        ['\\ln(a+b) = \\ln a + \\ln b', false, 'The log law is ln(ab) = ln a + ln b. There is no rule for ln(a+b).'],
        ['\\frac{x^2 - 9}{x-3} = x + 3 \\ (x\\neq 3)', true, 'True: factor the top as (x−3)(x+3) and cancel the factor.'],
        ['x^{1/2}\\cdot x^{1/3} = x^{1/6}', false, 'Add exponents: 1/2 + 1/3 = 5/6, so x^{5/6}.'],
        ['(x^3)^2 = x^6', true, 'True: power of a power multiplies exponents.'],
        ['\\frac{2x + 4}{2} = x + 4', false, 'Divide every term: (2x+4)/2 = x + 2.'],
      ];
      const [s, truth, why] = pick(S);
      return mc(`True or false? $$${s}$$`, truth ? 'True' : 'False', ['True', 'False'], why, 'Plug in simple numbers to test it.');
    },
    function factorSmallestPower() {
      const a = ri(2, 9);
      return {
        q: `Factor ${T(`x^{3/2} - ${a}x^{1/2}`)} completely, then find all real zeros (comma-separated).`,
        type: 'list', answer: [0, a],
        hint: 'Factor out the smallest power, x^{1/2}.',
        sol: `$$x^{3/2} - ${a}x^{1/2} = x^{1/2}(x - ${a}) = 0 \\Rightarrow x = 0,\\ ${a}$$`,
      };
    },
  ];

  /* ======================= 2. FUNCTIONS ======================= */
  G.functions = [
    function composition() {
      const a = riNZ(-4, 4), b = ri(-6, 6), c = ri(-5, 5), k = ri(-3, 3);
      const f = (x) => a * x + b, g = (x) => x * x + c;
      const order = ri(0, 1);
      const val = order ? f(g(k)) : g(f(k));
      const ftex = polyTex([a, b]), gtex = polyTex([1, 0, c]);
      return {
        q: `Let ${T('f(x) = ' + ftex)} and ${T('g(x) = ' + gtex)}. Find ${T(order ? `f(g(${k}))` : `g(f(${k}))`)}.`,
        type: 'num', answer: val,
        hint: 'Work inside out: evaluate the inner function first.',
        sol: order ? `${T(`g(${k}) = ${g(k)}`)}, then ${T(`f(${g(k)}) = ${val}`)}.` : `${T(`f(${k}) = ${f(k)}`)}, then ${T(`g(${f(k)}) = ${val}`)}.`,
      };
    },
    function differenceQuotient() {
      const a = riNZ(-4, 4), b = ri(-7, 7), c = ri(-9, 9);
      return {
        q: `For ${T('f(x) = ' + polyTex([a, b, c]))}, simplify the difference quotient $$\\frac{f(x+h) - f(x)}{h}$$ <span class="muted small">(answer in terms of x and h, e.g. <code>4x + 2h - 3</code>)</span>`,
        type: 'expr', fn: (s) => 2 * a * s.x + a * s.h + b, vars: ['x', 'h'],
        hint: 'Expand f(x+h), subtract f(x) (everything without h cancels), then divide every term by h.',
        sol: `$$f(x+h) = ${a === 1 ? '' : a === -1 ? '-' : a}(x+h)^2 ${sgnTerm(b)}(x+h) ${sgnTerm(c)} = ${polyTex([a, 0, 0])} ${sgnTerm(2 * a, 'xh')} ${sgnTerm(a, 'h^2')} ${sgnTerm(b, 'x')} ${sgnTerm(b, 'h')} ${sgnTerm(c)}$$
          Subtract ${T('f(x)')}: everything without an ${T('h')} cancels. $$f(x+h) - f(x) = ${polyTex([2 * a, 0])}h ${sgnTerm(a, 'h^2')} ${sgnTerm(b, 'h')}$$ $$\\frac{f(x+h)-f(x)}{h} = ${polyTex([2 * a, 0])} ${sgnTerm(a, 'h')} ${sgnTerm(b)}$$
          As ${T('h\\to0')} this becomes ${T(`f'(x) = ${polyTex([2 * a, b])}`)}.`,
      };
    },
    function domain() {
      const a = ri(-5, 3), b = a + ri(1, 5);
      const correct = T(`[${a}, ${b})\\cup(${b}, \\infty)`);
      return mc(`Find the domain of $$f(x) = \\frac{\\sqrt{${lin(a)}}}{${lin(b)}}$$`, correct,
        [`(${a}, \\infty)`, `[${a}, \\infty)`, `(-\\infty, ${b})\\cup(${b}, \\infty)`, `(${a}, ${b})\\cup(${b}, \\infty)`].map(T),
        `Radicand ${T(`${lin(a)} \\ge 0 \\Rightarrow x \\ge ${a}`)}; denominator ${T(`\\ne 0 \\Rightarrow x \\ne ${b}`)}. Domain: ${correct}.`,
        'Two restrictions: even root ≥ 0, denominator ≠ 0.');
    },
    function inverseValue() {
      if (ri(0, 1)) {
        const a = riNZ(-5, 5), b = ri(-9, 9), x0 = ri(-5, 5), k = a * x0 + b;
        return {
          q: `${T('f(x) = ' + polyTex([a, b]))}. Find ${T(`f^{-1}(${k})`)}.`,
          type: 'num', answer: x0, hint: 'f⁻¹(k) is the input that makes f output k. Solve f(x) = k.',
          sol: `Solve ${T(`${polyTex([a, b])} = ${k}`)}: ${T(`x = \\frac{${k} - (${b})}{${a}} = ${x0}`)}. Check: ${T(`f(${x0}) = ${k}`)} ✓.`,
        };
      }
      const b = ri(-9, 9), x0 = ri(-3, 3), k = x0 ** 3 + b;
      return {
        q: `${T('f(x) = x^3' + sgnTerm(b))}. Find ${T(`f^{-1}(${k})`)}.`,
        type: 'num', answer: x0, hint: 'Swap x and y, solve for y, or just solve f(x) = k.',
        sol: `${T(`x^3 ${sgnTerm(b)} = ${k} \\Rightarrow x^3 = ${k - b} \\Rightarrow x = \\sqrt[3]{${k - b}} = ${x0}`)}.`,
      };
    },
    function evenOdd() {
      const F = [['x^4 - 3x^2', 'Even'], ['x^3 + x', 'Odd'], ['x^3 + 1', 'Neither'], ['x\\sin x', 'Even'], ['x^2\\sin x', 'Odd'], ['|x| + \\cos x', 'Even'], ['e^x', 'Neither'], ['\\frac{x}{x^2+1}', 'Odd'], ['\\sin x + \\cos x', 'Neither'], ['\\tan x', 'Odd'], ['x^2 - 2x', 'Neither'], ['\\cos(3x)', 'Even']];
      const [f, ans] = pick(F);
      return mc(`Is ${T('f(x) = ' + f)} even, odd, or neither?`, ans, ['Even', 'Odd', 'Neither'],
        `Compute ${T('f(-x)')} using ${T('\\sin(-x) = -\\sin x')}, ${T('\\cos(-x) = \\cos x')}, ${T('(-x)^n = \\pm x^n')}. ${ans === 'Even' ? 'f(−x) = f(x) → even.' : ans === 'Odd' ? 'f(−x) = −f(x) → odd.' : 'f(−x) equals neither f(x) nor −f(x) → neither.'}`,
        'Substitute −x and compare to f(x) and −f(x).');
    },
    function avgRate() {
      const b = ri(-6, 6), p = ri(-4, 3), q = p + ri(1, 4);
      const f = (x) => x * x + b * x;
      return {
        q: `Find the average rate of change of ${T('f(x) = ' + polyTex([1, b, 0]))} on ${T(`[${p}, ${q}]`)}.`,
        type: 'num', answer: (f(q) - f(p)) / (q - p), hint: '(f(b) − f(a)) / (b − a): slope of the secant line.',
        sol: `${T(`\\frac{f(${q}) - f(${p})}{${q} - (${p})} = \\frac{${f(q)} - (${f(p)})}{${q - p}} = ${(f(q) - f(p)) / (q - p)}`)}.`,
      };
    },
    function transformations() {
      const hh = riNZ(-5, 5), k = riNZ(-5, 5), a = pick([-2, -1, 2, 3]);
      const desc = (H, K, A) => `${A < 0 ? 'reflect over x-axis, ' : ''}${Math.abs(A) !== 1 ? `vertical stretch ×${Math.abs(A)}, ` : ''}${H > 0 ? 'right' : 'left'} ${Math.abs(H)}, ${K > 0 ? 'up' : 'down'} ${Math.abs(K)}`;
      const q = `How is the graph of ${T(`y = ${a === -1 ? '-' : a}f(${lin(hh)}) ${sgnTerm(k)}`)} obtained from ${T('y = f(x)')}?`;
      return mc(q, desc(hh, k, a), [desc(-hh, k, a), desc(hh, -k, a), desc(-hh, -k, -a), desc(hh, k, -a)],
        `Inside ${T(lin(hh))} shifts horizontally the opposite way of its sign → ${hh > 0 ? 'right' : 'left'} ${Math.abs(hh)}. Outside constant ${T(k)} → ${k > 0 ? 'up' : 'down'} ${Math.abs(k)}. Coefficient ${T(a)} → ${a < 0 ? 'reflection + ' : ''}stretch ×${Math.abs(a)}.`,
        'Inside changes act on x (opposite direction); outside changes act on y.');
    },
  ];

  /* ======================= 3. LINES & GEOMETRY ======================= */
  G.lines = [
    function tangentIntercept() {
      const x1 = ri(-5, 5), y1 = ri(-6, 6), m = riNZ(-5, 5);
      return {
        q: `A tangent line passes through ${T(`(${x1}, ${y1})`)} with slope ${T(m)}. Write it as ${T('y = mx + b')} and enter ${T('b')}.`,
        type: 'num', answer: y1 - m * x1, hint: 'Point-slope: y − y₁ = m(x − x₁), then solve for y.',
        sol: `${T(`y - (${y1}) = ${m}(x - (${x1}))`)} ⟹ ${T(`y = ${m}x ${sgnTerm(y1 - m * x1) || '+ 0'}`)}. So ${T(`b = ${y1 - m * x1}`)}.`,
      };
    },
    function perpendicularSlope() {
      const x1 = ri(-6, 6), y1 = ri(-6, 6); let dx = riNZ(-6, 6), dy = riNZ(-6, 6);
      const x2 = x1 + dx, y2 = y1 + dy;
      return {
        q: `Find the slope of a line <b>perpendicular</b> to the line through ${T(`(${x1}, ${y1})`)} and ${T(`(${x2}, ${y2})`)}.`,
        type: 'num', answer: -dx / dy, hint: 'Find the slope, then take the negative reciprocal.',
        sol: `${T(`m = \\frac{${y2} - (${y1})}{${x2} - (${x1})} = ${fracTex(dy, dx)}`)}; perpendicular slope ${T(`= ${fracTex(-dx, dy)}`)}.`,
      };
    },
    function distance() {
      const [a, b] = pick([[3, 4], [5, 12], [6, 8], [8, 15], [1, 1], [1, 2], [2, 3]]);
      const x1 = ri(-5, 5), y1 = ri(-5, 5), sx = pick([1, -1]), sy = pick([1, -1]);
      const x2 = x1 + sx * a, y2 = y1 + sy * b, d2 = a * a + b * b;
      const d = Math.sqrt(d2), exact = Number.isInteger(d) ? String(d) : `\\sqrt{${d2}}`;
      return {
        q: `Find the distance between ${T(`(${x1}, ${y1})`)} and ${T(`(${x2}, ${y2})`)}. <span class="muted small">(sqrt(…) allowed)</span>`,
        type: 'num', answer: d, hint: 'd = √((x₂−x₁)² + (y₂−y₁)²)',
        sol: `${T(`d = \\sqrt{(${x2 - x1})^2 + (${y2 - y1})^2} = \\sqrt{${d2}} = ${exact}`)}.`,
      };
    },
    function circleCenter() {
      const hh = ri(-6, 6), k = ri(-6, 6), r = ri(1, 7);
      const D = -2 * hh, E = -2 * k, F = hh * hh + k * k - r * r;
      return {
        q: `Find the center ${T('(h,k)')} and radius ${T('r')} of $$x^2 + y^2${sgnTerm(D, 'x')}${sgnTerm(E, 'y')}${sgnTerm(F)} = 0$$`,
        type: 'multi', fields: [{ label: 'h', answer: hh }, { label: 'k', answer: k }, { label: 'r', answer: r }],
        hint: 'Group x terms and y terms, complete the square in each.',
        sol: `$$(x^2${sgnTerm(D, 'x')} + ${hh * hh}) + (y^2${sgnTerm(E, 'y')} + ${k * k}) = ${-F} + ${hh * hh} + ${k * k}$$ $$(${lin(hh)})^2 + (${lin(k, 'y')})^2 = ${r * r}$$ Center ${T(`(${hh}, ${k})`)}, radius ${T(r)}.`,
      };
    },
    function volumes() {
      const r = ri(1, 6), hh = ri(2, 9);
      const shapes = [
        ['cone', `V = \\tfrac13\\pi r^2 h`, (Math.PI * r * r * hh) / 3, `\\tfrac13\\pi(${r})^2(${hh}) = ${fracTex(r * r * hh, 3)}\\pi`],
        ['cylinder', `V = \\pi r^2 h`, Math.PI * r * r * hh, `\\pi(${r})^2(${hh}) = ${r * r * hh}\\pi`],
        ['sphere', `V = \\tfrac43\\pi r^3`, (4 * Math.PI * r ** 3) / 3, `\\tfrac43\\pi(${r})^3 = ${fracTex(4 * r ** 3, 3)}\\pi`],
      ];
      const [name, formula, val, work] = pick(shapes);
      return {
        q: `Find the volume of a ${name} with radius ${T(r)}${name !== 'sphere' ? ` and height ${T(hh)}` : ''}. <span class="muted small">(you may type pi)</span>`,
        type: 'num', answer: val, hint: 'Recall: ' + formula.replace(/\\tfrac(\d)(\d)/g, '$1/$2').replace(/\\pi/g, 'π').replace(/[\\{}]/g, ''),
        sol: `${T(formula)}: ${T(work)}.`,
      };
    },
    function similarTriangles() {
      const R = ri(2, 6), H = R * ri(2, 3) + ri(0, 2), hh = ri(1, H - 1);
      return {
        q: `A cone-shaped tank (vertex down) has top radius ${T(R)} m and height ${T(H)} m. When the water is ${T(hh)} m deep, what is the radius ${T('r')} of the water surface?`,
        type: 'num', answer: (R * hh) / H, hint: 'Similar triangles: r/h = R/H.',
        sol: `${T(`\\frac{r}{${hh}} = \\frac{${R}}{${H}} \\Rightarrow r = ${fracTex(R * hh, H)}`)} m. In related rates you'd use ${T(`r = \\frac{${R}}{${H}}h`)} to write ${T('V')} in terms of ${T('h')} only.`,
      };
    },
  ];

  /* ======================= 4. POLYNOMIAL & RATIONAL ======================= */
  G.polyrat = [
    function endBehavior() {
      const n = ri(2, 7), a = pick([-5, -3, -2, -1, 1, 2, 3, 4]);
      const even = n % 2 === 0;
      const lt = (a > 0) === even ? 'rises' : 'falls';
      const rt = a > 0 ? 'rises' : 'falls';
      const fmt = (L, Rr) => `left ${L}, right ${Rr}`;
      const lower = ri(-5, 5);
      return mc(`Describe the end behavior of $$p(x) = ${a === 1 ? '' : a === -1 ? '-' : a}x^{${n}} ${sgnTerm(lower, 'x^2')} + 7$$`,
        fmt(lt, rt), [fmt('rises', 'rises'), fmt('falls', 'falls'), fmt('falls', 'rises'), fmt('rises', 'falls')],
        `Only the leading term ${T(`${a}x^{${n}}`)} matters: degree ${n} is ${even ? 'even (both ends match)' : 'odd (ends opposite)'}, leading coefficient ${a > 0 ? 'positive' : 'negative'} → right end ${rt}.`,
        'Leading term only: even/odd degree and sign of the leading coefficient.');
    },
    function holeAndVA() {
      let a = ri(-5, 5), b = ri(-5, 5), c = ri(-5, 5);
      while (b === a) b = ri(-5, 5);
      while (c === a || c === b) c = ri(-5, 5);
      const num = [1, -(a + b), a * b], den = [1, -(a + c), a * c];
      return {
        q: `For $$f(x) = \\frac{${polyTex(num)}}{${polyTex(den)}}$$ find the ${T('x')}-coordinate of the <b>hole</b> and of the <b>vertical asymptote</b>.`,
        type: 'multi', fields: [{ label: 'hole x', answer: a }, { label: 'VA x', answer: c }],
        hint: 'Factor both. A factor that cancels is a hole; a factor left in the denominator is a VA.',
        sol: `$$f(x) = \\frac{(${lin(a)})(${lin(b)})}{(${lin(a)})(${lin(c)})} = \\frac{${lin(b)}}{${lin(c)}},\\ x\\neq ${a}$$ Hole at ${T('x = ' + a)} (at ${T(`y = ${fracTex(a - b, a - c)}`)}); VA at ${T('x = ' + c)}.`,
      };
    },
    function horizontalAsymptote() {
      const dTop = ri(1, 3), dBot = ri(1, 3);
      const a = riNZ(-6, 6), b = riNZ(-6, 6);
      const top = [a, ...Array.from({ length: dTop }, () => ri(-5, 5))], bot = [b, ...Array.from({ length: dBot }, () => ri(-5, 5))];
      if (bot[bot.length - 1] === 0) bot[bot.length - 1] = 1;
      const ans = dTop < dBot ? 0 : dTop === dBot ? a / b : null;
      return {
        q: `Find ${T('\\displaystyle\\lim_{x\\to\\infty} f(x)')} (the horizontal asymptote) for $$f(x) = \\frac{${polyTex(top)}}{${polyTex(bot)}}$$ <span class="muted small">Type <code>none</code> if there is no horizontal asymptote.</span>`,
        type: 'num', answer: ans, hint: 'Compare the degrees of top and bottom.',
        sol: dTop < dBot ? `Degree top (${dTop}) < degree bottom (${dBot}) → ${T('y = 0')}.` : dTop === dBot ? `Equal degrees → ratio of leading coefficients: ${T(`y = ${fracTex(a, b)}`)}.` : `Degree top (${dTop}) > degree bottom (${dBot}) → no horizontal asymptote (the function grows without bound).`,
      };
    },
    function multiplicity() {
      const r = riNZ(-5, 5), m = ri(1, 4), other = riNZ(-5, 5) === r ? r + 1 : r + ri(1, 3);
      const cross = m % 2 === 1;
      return mc(`At ${T('x = ' + r)}, does the graph of ${T(`p(x) = (${lin(r)})^{${m}}(${lin(other)})`)} cross or touch the x-axis?`,
        cross ? 'Crosses' : 'Touches and turns around', ['Crosses', 'Touches and turns around'],
        `Multiplicity ${m} is ${cross ? 'odd → sign changes → crosses' : 'even → sign does not change → touches'}.`, 'Odd multiplicity crosses; even multiplicity touches.');
    },
    function holeY() {
      let a = ri(-5, 5), b = ri(-5, 5), c = ri(-5, 5);
      while (b === a) b = ri(-5, 5);
      while (c === a || c === b) c = ri(-5, 5);
      return {
        q: `${T(`f(x) = \\dfrac{(${lin(a)})(${lin(b)})}{(${lin(a)})(${lin(c)})}`)} has a hole at ${T('x = ' + a)}. Find its ${T('y')}-coordinate, i.e. ${T(`\\lim_{x\\to ${a}} f(x)`)}.`,
        type: 'num', answer: (a - b) / (a - c), hint: 'Cancel the common factor, then plug in.',
        sol: `${T(`f(x) = \\frac{${lin(b)}}{${lin(c)}}`)} for ${T('x\\ne' + a)}; at ${T('x=' + a)}: ${T(`\\frac{${a} - (${b})}{${a} - (${c})} = ${fracTex(a - b, a - c)}`)}.`,
      };
    },
    function slantAsymptote() {
      const r = riNZ(-4, 4), b = ri(-6, 6), c = ri(-9, 9);
      const m = b + r, rem = c + r * (b + r);
      return {
        q: `Use long division to find the slant asymptote of $$f(x) = \\frac{${polyTex([1, b, c])}}{${lin(r)}}$$ It has the form ${T('y = x + m')}. Enter ${T('m')}.`,
        type: 'num', answer: m, hint: 'Divide: the quotient (without the remainder) is the asymptote.',
        sol: `$$\\frac{${polyTex([1, b, c])}}{${lin(r)}} = x ${sgnTerm(m) || '+ 0'} + \\frac{${rem}}{${lin(r)}}$$ The remainder term → 0 as ${T('x\\to\\pm\\infty')}, so ${T(`y = x ${sgnTerm(m) || ''}`)}.`,
      };
    },
  ];

  /* ======================= 5. EXP & LOG ======================= */
  G.explog = [
    function evalLog() {
      const opts = [];
      [2, 3, 4, 5, 10, 8, 9, 27, 16].forEach((b) => {
        for (let k = -3; k <= 4; k++) { const v = b ** k; if (v <= 1000 && v >= 1 / 1000) opts.push([b, k, v]); }
      });
      const roots = [[4, 2, 0.5], [9, 3, 0.5], [8, 2, 1 / 3], [27, 3, 1 / 3], [16, 2, 0.25], [25, 5, 0.5], [16, 4, 0.5]];
      if (ri(0, 3) === 0) {
        const [b, x, ans] = pick(roots);
        return { q: `Evaluate ${T(`\\log_{${b}} ${x}`)}.`, type: 'num', answer: ans, hint: `What power of ${b} gives ${x}?`, sol: `${T(`${b}^{${fracTex(Math.round(ans * 12), 12)}} = ${x}`)} so the answer is ${T(fracTex(Math.round(ans * 12), 12))}.` };
      }
      const [b, k, v] = pick(opts);
      const vt = k >= 0 ? String(v) : `\\frac{1}{${b ** -k}}`;
      return { q: `Evaluate ${T(`\\log_{${b}}\\left(${vt}\\right)`)}.`, type: 'num', answer: k, hint: `Ask: ${b} to what power equals ${k >= 0 ? v : '1/' + b ** -k}?`, sol: `${T(`${b}^{${k}} = ${vt}`)} so ${T(`\\log_{${b}}\\left(${vt}\\right) = ${k}`)}.` };
    },
    function expandLog() {
      const a = ri(2, 6), c = ri(1, 5), root = pick([2, 3]);
      return {
        q: `Expand $$\\ln\\!\\left(\\frac{x^{${a}}\\,${root === 2 ? '\\sqrt{y}' : '\\sqrt[3]{y}'}}{z^{${c}}}\\right) = A\\ln x + B\\ln y + C\\ln z$$`,
        type: 'multi', fields: [{ label: 'A', answer: a }, { label: 'B', answer: 1 / root }, { label: 'C', answer: -c }],
        hint: 'Quotient → subtract, product → add, power → coefficient. Roots are fractional powers.',
        sol: `${T(`= \\ln x^{${a}} + \\ln y^{1/${root}} - \\ln z^{${c}} = ${a}\\ln x + \\tfrac1{${root}}\\ln y - ${c}\\ln z`)}.`,
      };
    },
    function solveExp() {
      const A = ri(2, 6), k = riNZ(-3, 4), N = A * ri(2, 9);
      return {
        q: `Solve for ${T('x')}: ${T(`${A}e^{${k}x} = ${N}`)}. <span class="muted small">(exact like ln(4)/3 or decimal)</span>`,
        type: 'num', answer: Math.log(N / A) / k, hint: 'Isolate the exponential, then take ln of both sides.',
        sol: `${T(`e^{${k}x} = ${N / A} \\Rightarrow ${k}x = \\ln ${N / A} \\Rightarrow x = \\frac{\\ln ${N / A}}{${k}} \\approx ${(Math.log(N / A) / k).toFixed(4)}`)}.`,
      };
    },
    function logEquation() {
      const a = ri(1, 6), r = a + ri(1, 6), c = r * (r - a), other = -(r - a) + 0; // roots r and a - r
      const b = pick([2, 3, 10]);
      return {
        q: `Solve: ${T(`\\log_{${b}} x + \\log_{${b}}(x - ${a}) = \\log_{${b}} ${c}`)}`,
        type: 'num', answer: r, hint: 'Condense the left side into one log, set the arguments equal, and check the domain.',
        sol: `${T(`\\log_{${b}}[x(x-${a})] = \\log_{${b}} ${c} \\Rightarrow x^2 - ${a}x - ${c} = 0 \\Rightarrow (x - ${r})(x + ${r - a}) = 0`)}. Reject ${T(`x = ${a - r}`)} (log of a negative). Answer ${T('x = ' + r)}.`,
      };
    },
    function continuousInterest() {
      const P = pick([500, 1000, 2000, 5000]), r = pick([0.03, 0.04, 0.05, 0.06, 0.08]), t = pick([5, 10, 15, 20]);
      const A = P * Math.exp(r * t);
      return {
        q: `${T('$' + P)} is invested at ${T((r * 100).toFixed(0) + '\\%')} compounded continuously. What is it worth after ${T(t)} years? <span class="muted small">(to the nearest cent, or type the exact expression)</span>`,
        type: 'num', answer: A, hint: 'A = Pe^{rt}',
        sol: `${T(`A = ${P}e^{${r}\\cdot ${t}} = ${P}e^{${+(r * t).toFixed(2)}} \\approx ${A.toFixed(2)}`)}.`,
      };
    },
    function halfLife() {
      const T0 = pick([3, 5, 8, 10, 12]), n = ri(1, 5), A0 = pick([80, 160, 320, 640, 1000]);
      return {
        q: `A substance has a half-life of ${T(T0)} years. Starting with ${T(A0)} g, how much remains after ${T(T0 * n)} years?`,
        type: 'num', answer: A0 / 2 ** n, hint: 'A = A₀(1/2)^{t/T}',
        sol: `${T(`A = ${A0}\\left(\\tfrac12\\right)^{${T0 * n}/${T0}} = ${A0}\\cdot\\tfrac{1}{${2 ** n}} = ${A0 / 2 ** n}`)} g. Equivalently ${T(`A = A_0e^{kt}`)} with ${T(`k = -\\frac{\\ln 2}{${T0}}`)}.`,
      };
    },
    function logLawsTF() {
      const S = [
        ['\\ln(ab) = \\ln a + \\ln b', true], ['\\ln(a+b) = \\ln a + \\ln b', false], ['\\ln(x^5) = 5\\ln x', true], ['(\\ln x)^2 = 2\\ln x', false],
        ['\\frac{\\ln a}{\\ln b} = \\ln a - \\ln b', false], ['e^{\\ln 7} = 7', true], ['\\ln\\frac{1}{x} = -\\ln x', true], ['\\log_2 8 = \\frac{\\ln 8}{\\ln 2}', true], ['\\ln 0 = 1', false], ['\\ln(e^{3x}) = 3x', true],
      ];
      const [s, t] = pick(S);
      return mc(`True or false? ${T(s)}`, t ? 'True' : 'False', ['True', 'False'], t ? 'This is a valid identity — memorize it.' : 'This is a classic error. The real laws: ln(ab)=ln a+ln b, ln(a/b)=ln a−ln b, ln(aʳ)=r ln a; ln 0 is undefined.', 'Recall the three log laws.');
    },
  ];

  /* ======================= 6. TRIG ======================= */
  G.trig = [
    function unitCircleValue() {
      const k = pick(SPECIAL_K), fn = pick(['sin', 'cos', 'tan']);
      const ex = exactTrig(k); const th = (k * Math.PI) / 12;
      const val = fn === 'sin' ? Math.sin(th) : fn === 'cos' ? Math.cos(th) : (k % 12 === 6 ? null : Math.tan(th));
      const exact = ex[fn];
      return {
        q: `Find the exact value: ${T(`\\${fn}\\left(${angleTex(k)}\\right)`)} <span class="muted small">(e.g. <code>sqrt(3)/2</code>, <code>-1/2</code>, or <code>undefined</code>)</span>`,
        type: 'num', answer: val === null ? null : Math.abs(val) < 1e-12 ? 0 : val, hint: 'Find the reference angle, then the sign from the quadrant (ASTC).',
        sol: `${T(`${angleTex(k)} = ${k * 15}^\\circ`)}. Point on the unit circle: ${T(`(${ex.cos}, ${ex.sin})`)}. So ${T(`\\${fn}\\left(${angleTex(k)}\\right) = ${exact}`)}.`,
      };
    },
    function degRad() {
      const k = ri(-12, 24); const deg = k * 15;
      if (ri(0, 1)) {
        return { q: `Convert ${T(deg + '^\\circ')} to radians. <span class="muted small">(type pi)</span>`, type: 'num', answer: (deg * Math.PI) / 180, hint: 'Multiply by π/180.', sol: `${T(`${deg}\\cdot\\frac{\\pi}{180} = ${k < 0 ? '-' + angleTex(-k) : angleTex(k)}`)}.` };
      }
      return { q: `Convert ${T(k < 0 ? '-' + angleTex(-k) : angleTex(k))} to degrees.`, type: 'num', answer: deg, hint: 'Multiply by 180/π.', sol: `${T(`${k < 0 ? '-' + angleTex(-k) : angleTex(k)}\\cdot\\frac{180^\\circ}{\\pi} = ${deg}^\\circ`)}.` };
    },
    function inverseTrig() {
      const fn = pick(['arcsin', 'arccos', 'arctan']);
      const pool = {
        arcsin: [[-6, '-1'], [-4, '-\\frac{\\sqrt3}2'], [-3, '-\\frac{\\sqrt2}2'], [-2, '-\\frac12'], [0, '0'], [2, '\\frac12'], [3, '\\frac{\\sqrt2}2'], [4, '\\frac{\\sqrt3}2'], [6, '1']],
        arccos: [[12, '-1'], [10, '-\\frac{\\sqrt3}2'], [9, '-\\frac{\\sqrt2}2'], [8, '-\\frac12'], [6, '0'], [4, '\\frac12'], [3, '\\frac{\\sqrt2}2'], [2, '\\frac{\\sqrt3}2'], [0, '1']],
        arctan: [[-4, '-\\sqrt3'], [-3, '-1'], [-2, '-\\frac{\\sqrt3}3'], [0, '0'], [2, '\\frac{\\sqrt3}{3}'], [3, '1'], [4, '\\sqrt3']],
      };
      const [k, v] = pick(pool[fn]);
      const range = { arcsin: '[-\\frac\\pi2,\\frac\\pi2]', arccos: '[0,\\pi]', arctan: '(-\\frac\\pi2,\\frac\\pi2)' }[fn];
      const ans = k < 0 ? '-' + angleTex(-k) : angleTex(k);
      return { q: `Evaluate ${T(`\\${fn}\\left(${v}\\right)`)} in radians.`, type: 'num', answer: (k * Math.PI) / 12, hint: `The output must lie in ${'$' + range + '$'}.`, sol: `Range of ${fn} is ${T(range)}. The angle there with ${fn.slice(3)} ${T('= ' + v)} is ${T(ans)}.` };
    },
    function triangleTrick() {
      const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [1, 1, null], [1, 2, null]]);
      const hyp = c || Math.sqrt(a * a + b * b); const hypT = c ? String(c) : `\\sqrt{${a * a + b * b}}`;
      const which = pick(['sin', 'cos', 'sec']);
      const val = which === 'sin' ? a / hyp : which === 'cos' ? b / hyp : hyp / b;
      const valT = which === 'sin' ? `\\frac{${a}}{${hypT}}` : which === 'cos' ? `\\frac{${b}}{${hypT}}` : `\\frac{${hypT}}{${b}}`;
      return {
        q: `Evaluate exactly: ${T(`\\${which}\\left(\\arctan\\frac{${a}}{${b}}\\right)`)} <span class="muted small">(sqrt(…) allowed)</span>`,
        type: 'num', answer: val, hint: 'Let θ = arctan(a/b). Draw a right triangle with opposite a, adjacent b.',
        sol: `${T(`\\tan\\theta = \\frac{${a}}{${b}}`)}: opposite ${T(a)}, adjacent ${T(b)}, hypotenuse ${T(`\\sqrt{${a}^2+${b}^2} = ${hypT}`)}. So ${T(`\\${which}\\theta = ${valT}`)}. (This is exactly the move in trig substitution.)`,
      };
    },
    function solveTrigEq() {
      const fn = pick(['sin', 'cos', 'tan']);
      const k0 = pick(SPECIAL_K.filter((k) => !(fn === 'tan' && k % 12 === 6)));
      const th0 = (k0 * Math.PI) / 12;
      const F = { sin: Math.sin, cos: Math.cos, tan: Math.tan }[fn];
      const target = F(th0); const exT = exactTrig(k0)[fn];
      const sols = SPECIAL_K.filter((k) => !(fn === 'tan' && k % 12 === 6) && Math.abs(F((k * Math.PI) / 12) - target) < 1e-9);
      return {
        q: `Solve on ${T('[0, 2\\pi)')}: ${T(`\\${fn} x = ${exT}`)}. <span class="muted small">(all solutions, comma-separated, e.g. <code>pi/6, 5pi/6</code>)</span>`,
        type: 'list', answer: sols.map((k) => (k * Math.PI) / 12), hint: fn === 'tan' ? 'tan has period π: one solution, then add π.' : 'Find the reference angle, then every quadrant where the sign matches.',
        sol: `Solutions: ${sols.map((k) => T(angleTex(k))).join(', ')}.`,
      };
    },
    function periodAmplitude() {
      const A = riNZ(-5, 5), B = pick([1, 2, 3, 4, 0.5]), D = ri(-3, 3), fn = pick(['sin', 'cos']);
      const Bt = B === 0.5 ? '\\tfrac12' : B === 1 ? '' : B;
      return {
        q: `For ${T(`y = ${A === 1 ? '' : A === -1 ? '-' : A}\\${fn}(${Bt}x) ${sgnTerm(D)}`)}, find the amplitude and period.`,
        type: 'multi', fields: [{ label: 'amplitude', answer: Math.abs(A) }, { label: 'period', answer: (2 * Math.PI) / B }],
        hint: 'Amplitude |A|; period 2π/|B|.',
        sol: `Amplitude ${T(`|${A}| = ${Math.abs(A)}`)}; period ${T(`\\frac{2\\pi}{${B === 0.5 ? '1/2' : B}} = ${{ 1: '2\\pi', 2: '\\pi', 0.5: '4\\pi', 3: '\\frac{2\\pi}{3}', 4: '\\frac{\\pi}{2}' }[B]}`)}.`,
      };
    },
    function identities() {
      const S = [
        ['\\cos^2 x', '\\frac{1 + \\cos 2x}{2}', ['\\frac{1 - \\cos 2x}{2}', '1 + \\sin^2 x', '2\\cos x']],
        ['\\sin^2 x', '\\frac{1 - \\cos 2x}{2}', ['\\frac{1 + \\cos 2x}{2}', '1 - \\sin 2x', '\\cos^2 x - 1']],
        ['\\sin 2x', '2\\sin x\\cos x', ['2\\sin x', '\\sin^2 x - \\cos^2 x', '\\sin x + \\cos x']],
        ['1 + \\tan^2 x', '\\sec^2 x', ['\\csc^2 x', '\\cot^2 x', '1']],
        ['\\cos 2x', '1 - 2\\sin^2 x', ['2\\sin^2 x - 1', '1 - 2\\cos^2 x', '2\\cos x']],
        ['1 + \\cot^2 x', '\\csc^2 x', ['\\sec^2 x', '\\tan^2 x', '0']],
        ['\\sin(-x)', '-\\sin x', ['\\sin x', '\\cos x', '-\\cos x']],
        ['\\cos(a + b)', '\\cos a\\cos b - \\sin a\\sin b', ['\\cos a\\cos b + \\sin a\\sin b', '\\cos a + \\cos b', '\\sin a\\cos b + \\cos a\\sin b']],
        ['\\sec^2 x - \\tan^2 x', '1', ['0', '-1', '\\sec x']],
      ];
      const [lhs, rhs, wr] = pick(S);
      return mc(`Which expression equals ${T(lhs)}?`, T(rhs), wr.map(T), `${T(`${lhs} = ${rhs}`)} &mdash; one of the identities to know cold.`, 'Pythagorean, double-angle, power-reducing, sum/difference, even/odd.');
    },
    function arcSector() {
      const r = ri(2, 10), k = pick([2, 3, 4, 6, 8, 9]);
      const th = (k * Math.PI) / 12;
      if (ri(0, 1)) return { q: `Find the arc length on a circle of radius ${T(r)} subtended by ${T('\\theta = ' + angleTex(k))}.`, type: 'num', answer: r * th, hint: 's = rθ (θ in radians)', sol: `${T(`s = r\\theta = ${r}\\cdot${angleTex(k)}`)} ${T('\\approx ' + (r * th).toFixed(4))}.` };
      return { q: `Find the area of a sector with radius ${T(r)} and angle ${T('\\theta = ' + angleTex(k))}.`, type: 'num', answer: 0.5 * r * r * th, hint: 'A = ½r²θ', sol: `${T(`A = \\tfrac12 (${r})^2 \\cdot ${angleTex(k)}`)} ${T('\\approx ' + (0.5 * r * r * th).toFixed(4))}.` };
    },
  ];

  /* ======================= 7. SERIES ======================= */
  G.series = [
    function sigmaFormula() {
      const n = ri(5, 40), a = riNZ(-4, 5), b = ri(-6, 6);
      const kind = ri(0, 2);
      if (kind === 0) return { q: `Evaluate ${T(`\\displaystyle\\sum_{i=1}^{${n}} i`)}.`, type: 'num', answer: (n * (n + 1)) / 2, hint: 'n(n+1)/2', sol: T(`\\frac{${n}(${n + 1})}{2} = ${(n * (n + 1)) / 2}`) };
      if (kind === 1) { const v = (n * (n + 1) * (2 * n + 1)) / 6; return { q: `Evaluate ${T(`\\displaystyle\\sum_{i=1}^{${n}} i^2`)}.`, type: 'num', answer: v, hint: 'n(n+1)(2n+1)/6', sol: T(`\\frac{${n}(${n + 1})(${2 * n + 1})}{6} = ${v}`) }; }
      const v = (a * n * (n + 1)) / 2 + b * n;
      return { q: `Evaluate ${T(`\\displaystyle\\sum_{i=1}^{${n}} (${a}i ${sgnTerm(b)})`)}.`, type: 'num', answer: v, hint: 'Split the sum: a·Σi + Σb = a·n(n+1)/2 + bn.', sol: T(`${a}\\cdot\\frac{${n}(${n + 1})}{2} ${sgnTerm(b)}\\cdot ${n} = ${v}`) };
    },
    function infiniteGeometric() {
      const a = riNZ(-9, 12); const [rn, rd] = pick([[1, 2], [-1, 2], [1, 3], [2, 3], [-2, 3], [1, 4], [3, 4], [3, 2], [-5, 4]]);
      const r = rn / rd; const conv = Math.abs(r) < 1;
      return {
        q: `Find the sum, or type <code>diverges</code>: $$\\sum_{n=0}^{\\infty} ${a}\\left(${fracTex(rn, rd)}\\right)^n$$`,
        type: 'num', answer: conv ? a / (1 - r) : null, hint: 'Converges iff |r| < 1; then sum = a/(1 − r).',
        sol: conv ? `${T(`|r| = ${fracTex(Math.abs(rn), rd)} < 1`)}: ${T(`S = \\frac{${a}}{1 - (${fracTex(rn, rd)})} = ${fracTex(a * rd, rd - rn)}`)}.` : `${T(`|r| = ${fracTex(Math.abs(rn), rd)} \\ge 1`)} → diverges.`,
      };
    },
    function arithmeticTerm() {
      const a1 = ri(-10, 10), d = riNZ(-6, 7), n = ri(10, 60);
      return { q: `An arithmetic sequence has ${T('a_1 = ' + a1)} and common difference ${T('d = ' + d)}. Find ${T('a_{' + n + '}')}.`, type: 'num', answer: a1 + (n - 1) * d, hint: 'aₙ = a₁ + (n − 1)d', sol: T(`a_{${n}} = ${a1} + ${n - 1}(${d}) = ${a1 + (n - 1) * d}`) };
    },
    function binomialCoeff() {
      const n = ri(4, 9), k = ri(1, n - 1);
      const C = (nn, kk) => { let r = 1; for (let i = 1; i <= kk; i++) r = (r * (nn - kk + i)) / i; return Math.round(r); };
      return { q: `Find the coefficient of ${T(`x^{${n - k}}h^{${k}}`)} in the expansion of ${T(`(x + h)^{${n}}`)}.`, type: 'num', answer: C(n, k), hint: 'Binomial coefficient C(n, k) = n!/(k!(n−k)!).', sol: T(`\\binom{${n}}{${k}} = \\frac{${n}!}{${k}!\\,${n - k}!} = ${C(n, k)}`) };
    },
    function geometricFinite() {
      const a = riNZ(-5, 6), r = pick([2, 3, -2, -3]), n = ri(4, 8);
      const S = (a * (1 - r ** n)) / (1 - r);
      return { q: `Find ${T(`\\displaystyle\\sum_{k=0}^{${n - 1}} ${a}(${r})^k`)}.`, type: 'num', answer: S, hint: 'Sₙ = a(1 − rⁿ)/(1 − r) with n terms.', sol: T(`S_{${n}} = ${a}\\cdot\\frac{1 - (${r})^{${n}}}{1 - (${r})} = ${S}`) };
    },
    function riemannRight() {
      const b = pick([2, 4, 6]), n = 4, dx = b / n;
      let S = 0; const terms = [];
      for (let i = 1; i <= n; i++) { const x = i * dx; S += x * x * dx; terms.push(`f(${+x.toFixed(2)})`); }
      return { q: `Approximate ${T(`\\int_0^{${b}} x^2\\,dx`)} using a right-endpoint Riemann sum with ${T('n = 4')} rectangles.`, type: 'num', answer: S, hint: 'Δx = (b − a)/n; sum f(right endpoint)·Δx.', sol: `${T(`\\Delta x = ${dx}`)}; ${T(`R_4 = ${dx}\\,[${terms.join(' + ')}] = ${S}`)} (exact area ${T(fracTex(b ** 3, 3))}).` };
    },
  ];

  /* ======================= 8. POLAR ======================= */
  G.polar = [
    function polarToRect() {
      const r = ri(1, 6), k = pick(SPECIAL_K.filter((k) => k % 6 !== 0));
      const th = (k * Math.PI) / 12, ex = exactTrig(k);
      return {
        q: `Convert the polar point ${T(`(r, \\theta) = \\left(${r},\\ ${angleTex(k)}\\right)`)} to rectangular coordinates.`,
        type: 'multi', fields: [{ label: 'x', answer: r * Math.cos(th) }, { label: 'y', answer: r * Math.sin(th) }],
        hint: 'x = r cos θ, y = r sin θ.',
        sol: `${T(`x = ${r}\\cos ${angleTex(k)} = ${r}\\cdot ${ex.cos}`)}, ${T(`y = ${r}\\sin ${angleTex(k)} = ${r}\\cdot ${ex.sin}`)}.`,
      };
    },
    function rectToPolar() {
      const r = ri(1, 5), k = pick(SPECIAL_K);
      const ex = exactTrig(k);
      const coord = (t) => (t === '0' ? '0' : t === '1' ? String(r) : t === '-1' ? String(-r) : r === 1 ? t : t.startsWith('-') ? `-${r}\\cdot${t.slice(1)}` : `${r}\\cdot${t}`);
      return {
        q: `Convert ${T(`(x, y) = \\left(${coord(ex.cos)},\\ ${coord(ex.sin)}\\right)`)} to polar ${T('(r, \\theta)')} with ${T('r > 0')}, ${T('0 \\le \\theta < 2\\pi')}.`,
        type: 'multi', fields: [{ label: 'r', answer: r }, { label: 'θ', answer: (k * Math.PI) / 12 }],
        hint: 'r = √(x² + y²); find θ from the signs (quadrant), not just arctan(y/x).',
        sol: `${T(`r = \\sqrt{x^2 + y^2} = ${r}`)}; the point is ${k % 6 === 0 ? 'on an axis' : 'in quadrant ' + ['I', 'II', 'III', 'IV'][Math.floor(k / 6)]}, so ${T('\\theta = ' + angleTex(k))}.`,
      };
    },
    function eliminateParameter() {
      const S = [
        ['x = 2\\cos t,\\ y = 2\\sin t', 'x^2 + y^2 = 4', ['y = 2x', 'x^2 - y^2 = 4', 'x + y = 2']],
        ['x = t + 1,\\ y = t^2', 'y = (x-1)^2', ['y = x^2 + 1', 'y = (x+1)^2', 'y = x - 1']],
        ['x = 3\\cos t,\\ y = 2\\sin t', '\\frac{x^2}{9} + \\frac{y^2}{4} = 1', ['\\frac{x^2}{4} + \\frac{y^2}{9} = 1', 'x^2 + y^2 = 6', '\\frac{x^2}{9} - \\frac{y^2}{4} = 1']],
        ['x = e^t,\\ y = e^{2t}', 'y = x^2,\\ x>0', ['y = 2x', 'y = e^x', 'y = \\sqrt x']],
        ['x = \\sec t,\\ y = \\tan t', 'x^2 - y^2 = 1', ['x^2 + y^2 = 1', 'y = x', 'y^2 - x^2 = 1']],
      ];
      const [p, ans, wr] = pick(S);
      return mc(`Eliminate the parameter: ${T(p)}`, T(ans), wr.map(T), `Use ${p.includes('cos') || p.includes('sec') ? 'a Pythagorean identity' : 'substitution (solve for t or square)'} → ${T(ans)}.`, 'Solve one equation for t, or use sin² + cos² = 1 / sec² − tan² = 1.');
    },
    function vectors() {
      const [a, b] = pick([[3, 4], [5, 12], [6, 8], [1, 1], [2, -3], [-4, 3]]);
      if (ri(0, 1)) return { q: `Find ${T(`|\\vec v|`)} for ${T(`\\vec v = \\langle ${a}, ${b}\\rangle`)}.`, type: 'num', answer: Math.hypot(a, b), hint: '√(a² + b²)', sol: T(`\\sqrt{(${a})^2 + (${b})^2} = \\sqrt{${a * a + b * b}}`) };
      const c = ri(-5, 5), d = ri(-5, 5);
      return { q: `Compute the dot product ${T(`\\langle ${a}, ${b}\\rangle \\cdot \\langle ${c}, ${d}\\rangle`)}.`, type: 'num', answer: a * c + b * d, hint: 'u₁v₁ + u₂v₂', sol: `${T(`${a}(${c}) + ${b}(${d}) = ${a * c + b * d}`)}${a * c + b * d === 0 ? ' — the vectors are perpendicular.' : '.'}` };
    },
    function rosePetals() {
      const n = ri(2, 7), a = ri(1, 4), fn = pick(['\\cos', '\\sin']);
      return { q: `How many petals does the rose ${T(`r = ${a}${fn}(${n}\\theta)`)} have?`, type: 'num', answer: n % 2 ? n : 2 * n, hint: 'n odd → n petals; n even → 2n petals.', sol: `${T('n = ' + n)} is ${n % 2 ? 'odd' : 'even'} → ${n % 2 ? n : 2 * n} petals.` };
    },
  ];

  /* ======================= 9. BRIDGE ======================= */
  G.bridge = [
    function factorLimit() {
      const r = riNZ(-6, 6), s = ri(-6, 6);
      const top = [1, -(r + s), r * s];
      return {
        q: `Evaluate: $$\\lim_{x\\to ${r}} \\frac{${polyTex(top)}}{${lin(r)}}$$`,
        type: 'num', answer: r - s, hint: 'Plugging in gives 0/0. Factor the numerator and cancel.',
        sol: `${T('\\frac{0}{0}')} → factor: ${T(`\\frac{(${lin(r)})(${lin(s)})}{${lin(r)}} = ${lin(s)} \\to ${r} - (${s}) = ${r - s}`)}.`,
      };
    },
    function limitAtInfinity() {
      const d = ri(1, 3), a = riNZ(-7, 7), b = riNZ(-7, 7);
      const lower = ri(0, 1);
      const top = lower ? [a, ...Array.from({ length: d - 1 }, () => ri(-5, 5))] : [a, ...Array.from({ length: d }, () => ri(-5, 5))];
      const bot = [b, ...Array.from({ length: d }, () => ri(-5, 5))];
      const ans = lower ? 0 : a / b;
      return {
        q: `Evaluate: $$\\lim_{x\\to\\infty}\\frac{${polyTex(top)}}{${polyTex(bot)}}$$`,
        type: 'num', answer: ans, hint: 'Divide every term by the highest power of x in the denominator.',
        sol: lower ? `Top degree ${d - 1} < bottom degree ${d} → limit ${T('0')}.` : `Equal degrees → ${T(`\\frac{${a}}{${b}} = ${fracTex(a, b)}`)}.`,
      };
    },
    function sinxOverX() {
      const a = riNZ(-7, 9), b = riNZ(-5, 7);
      if (ri(0, 1)) return { q: `Evaluate ${T(`\\displaystyle\\lim_{x\\to0}\\frac{\\sin(${a}x)}{x}`)}.`, type: 'num', answer: a, hint: 'Multiply and divide by the coefficient so you get sin(u)/u.', sol: T(`${a}\\cdot\\frac{\\sin(${a}x)}{${a}x} \\to ${a}\\cdot 1 = ${a}`) };
      return { q: `Evaluate ${T(`\\displaystyle\\lim_{x\\to0}\\frac{\\sin(${a}x)}{\\sin(${b}x)}`)}.`, type: 'num', answer: a / b, hint: 'Write as (sin(ax)/ax)·(bx/sin(bx))·(a/b).', sol: T(`\\frac{\\sin(${a}x)}{${a}x}\\cdot\\frac{${b}x}{\\sin(${b}x)}\\cdot\\frac{${a}}{${b}} \\to ${fracTex(a, b)}`) };
    },
    function secantSlope() {
      const a = ri(-4, 4), hh = pick([1, 0.5, 0.1, 0.01, 2]);
      return {
        q: `For ${T('f(x) = x^2')}, find the slope of the secant line from ${T('x = ' + a)} to ${T('x = ' + (a + hh))}.`,
        type: 'num', answer: 2 * a + hh, hint: '(f(a+h) − f(a))/h = 2a + h for x².',
        sol: `${T(`\\frac{(${a} + ${hh})^2 - (${a})^2}{${hh}} = 2(${a}) + ${hh} = ${+(2 * a + hh).toFixed(4)}`)}. As ${T('h\\to0')} this → ${T(`f'(${a}) = ${2 * a}`)}.`,
      };
    },
    function continuityK() {
      const a = ri(-3, 3), m = riNZ(-4, 4), b = ri(-5, 5);
      const k = m * a + b - a * a;
      return {
        q: `Find ${T('k')} so that ${T('f')} is continuous: $$f(x) = \\begin{cases} x^2 + k, & x &lt; ${a} \\\\ ${polyTex([m, b])}, & x \\ge ${a}\\end{cases}$$`,
        type: 'num', answer: k, hint: 'The two pieces must meet at the break point: set them equal at x = a.',
        sol: `${T(`(${a})^2 + k = ${m}(${a}) ${sgnTerm(b)} \\Rightarrow ${a * a} + k = ${m * a + b} \\Rightarrow k = ${k}`)}.`,
      };
    },
    function rationalizeLimit2() {
      const s = ri(2, 9), a = s * s;
      return {
        q: `Evaluate: $$\\lim_{x\\to ${a}}\\frac{\\sqrt{x} - ${s}}{x - ${a}}$$`,
        type: 'num', answer: 1 / (2 * s), hint: 'Multiply by the conjugate, or factor x − a as a difference of squares.',
        sol: `${T(`x - ${a} = (\\sqrt x - ${s})(\\sqrt x + ${s})`)}, so the limit is ${T(`\\frac{1}{\\sqrt{${a}} + ${s}} = \\frac{1}{${2 * s}}`)}.`,
      };
    },
    function indeterminateForm() {
      const r = riNZ(-5, 5), c = riNZ(-5, 5);
      const cases = [
        [`\\frac{x^2 - ${r * r}}{x ${r > 0 ? '-' : '+'} ${Math.abs(r)}}`, '0/0 — indeterminate: do more algebra', `top → 0 and bottom → 0`],
        [`\\frac{x + ${Math.abs(c) + Math.abs(r) + 1}}{x ${r > 0 ? '-' : '+'} ${Math.abs(r)}}`, 'nonzero/0 — vertical asymptote (±∞ or DNE)', `top → nonzero, bottom → 0`],
        [`\\frac{x^2 + 1}{x ${r > 0 ? '+' : '-'} ${Math.abs(r)}}`, 'a finite number — just plug in', `bottom ≠ 0`],
      ];
      const [expr, ans, why] = pick(cases);
      return mc(`What happens when you directly substitute ${T('x = ' + r)} into ${T(expr)}?`, ans, cases.map((c2) => c2[1]).concat(['0 — the limit is 0']), `Substituting: ${why}. ${ans}.`, 'Plug in and look at top and bottom separately.');
    },
  ];

  global.PROBLEMS = G;
  global.makeProblem = function (moduleId) {
    const gens = G[moduleId];
    const gen = pick(gens);
    const p = gen();
    p.gen = gen.name;
    p.module = moduleId;
    return p;
  };
})(window);
