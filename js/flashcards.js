/* Memorize deck + Leitner spaced repetition. */
(function (global) {
  const R = String.raw;
  const C = (m, front, back) => ({ m, front, back });
  const DECK = [
    // algebra
    C('algebra', R`$a^m \cdot a^n = $`, R`$a^{m+n}$`),
    C('algebra', R`$(a^m)^n = $`, R`$a^{mn}$`),
    C('algebra', R`$a^{-n} = $`, R`$\dfrac{1}{a^n}$`),
    C('algebra', R`$a^{m/n} = $`, R`$\sqrt[n]{a^m} = \left(\sqrt[n]{a}\right)^m$`),
    C('algebra', R`$\dfrac{1}{\sqrt[3]{x^2}}$ as a power of $x$`, R`$x^{-2/3}$`),
    C('algebra', R`$a^2 - b^2 = $`, R`$(a - b)(a + b)$`),
    C('algebra', R`$a^3 + b^3 = $`, R`$(a + b)(a^2 - ab + b^2)$`),
    C('algebra', R`$a^3 - b^3 = $`, R`$(a - b)(a^2 + ab + b^2)$`),
    C('algebra', R`$(a + b)^2 = $`, R`$a^2 + 2ab + b^2$`),
    C('algebra', R`Quadratic formula`, R`$x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}$`),
    C('algebra', R`Discriminant $b^2 - 4ac$: meaning of $&gt;0$, $=0$, $&lt;0$`, R`2 real roots / 1 double root / no real roots`),
    C('algebra', R`Vertex of $y = ax^2 + bx + c$`, R`$x = -\dfrac{b}{2a}$`),
    C('algebra', R`$\sqrt{x^2} = $`, R`$|x|$`),
    C('algebra', R`Remainder theorem`, R`$p(x) \div (x - r)$ leaves remainder $p(r)$`),
    // functions
    C('functions', R`Difference quotient`, R`$\dfrac{f(x+h) - f(x)}{h}$`),
    C('functions', R`$(f\circ g)(x) = $`, R`$f(g(x))$ — inner $g$ first`),
    C('functions', R`Even function test`, R`$f(-x) = f(x)$ — symmetric about $y$-axis`),
    C('functions', R`Odd function test`, R`$f(-x) = -f(x)$ — symmetric about the origin`),
    C('functions', R`Inverse function graph relationship`, R`Reflection over $y = x$; $(a,b) \leftrightarrow (b,a)$`),
    C('functions', R`$y = f(x - h) + k$ moves the graph…`, R`right $h$, up $k$`),
    C('functions', R`$y = f(bx)$ with $b &gt; 1$`, R`Horizontal compression by factor $1/b$`),
    C('functions', R`Average rate of change on $[a,b]$`, R`$\dfrac{f(b) - f(a)}{b - a}$ (secant slope)`),
    // lines
    C('lines', R`Point-slope form`, R`$y - y_1 = m(x - x_1)$`),
    C('lines', R`Tangent line to $f$ at $x=a$`, R`$y = f(a) + f'(a)(x - a)$`),
    C('lines', R`Perpendicular slopes`, R`$m_1 m_2 = -1$ (negative reciprocals)`),
    C('lines', R`Distance formula`, R`$\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$`),
    C('lines', R`Circle, center $(h,k)$ radius $r$`, R`$(x - h)^2 + (y - k)^2 = r^2$`),
    C('lines', R`Volume of a sphere`, R`$\tfrac43\pi r^3$`),
    C('lines', R`Surface area of a sphere`, R`$4\pi r^2$`),
    C('lines', R`Volume of a cone`, R`$\tfrac13\pi r^2 h$`),
    C('lines', R`Volume of a cylinder`, R`$\pi r^2 h$`),
    C('lines', R`Area of a circle / circumference`, R`$\pi r^2$ / $2\pi r$`),
    // polyrat
    C('polyrat', R`HA when deg(top) &lt; deg(bottom)`, R`$y = 0$`),
    C('polyrat', R`HA when deg(top) = deg(bottom)`, R`$y = \dfrac{\text{leading coeff top}}{\text{leading coeff bottom}}$`),
    C('polyrat', R`deg(top) = deg(bottom) + 1`, R`Slant asymptote: quotient from long division`),
    C('polyrat', R`Factor cancels from top &amp; bottom`, R`Hole (removable discontinuity)`),
    C('polyrat', R`Factor left in the denominator`, R`Vertical asymptote`),
    C('polyrat', R`Zero with odd vs. even multiplicity`, R`Odd: crosses the $x$-axis. Even: touches and turns.`),
    C('polyrat', R`End behavior of $-2x^5$`, R`Left rises, right falls`),
    // explog
    C('explog', R`$\ln(ab) = $`, R`$\ln a + \ln b$`),
    C('explog', R`$\ln\!\left(\frac ab\right) = $`, R`$\ln a - \ln b$`),
    C('explog', R`$\ln(a^r) = $`, R`$r \ln a$`),
    C('explog', R`$\ln 1 = $, $\ln e = $`, R`$0$, $1$`),
    C('explog', R`Change of base: $\log_b x = $`, R`$\dfrac{\ln x}{\ln b}$`),
    C('explog', R`$e^{\ln x} = $ and $\ln(e^x) = $`, R`$x$ (for $x&gt;0$) and $x$`),
    C('explog', R`Domain of $\ln x$`, R`$(0, \infty)$`),
    C('explog', R`Continuous growth / decay`, R`$A = A_0 e^{kt}$`),
    C('explog', R`Compound interest`, R`$A = P\left(1 + \frac rn\right)^{nt}$; continuous: $Pe^{rt}$`),
    C('explog', R`$e$ as a limit`, R`$\displaystyle\lim_{n\to\infty}\left(1 + \tfrac1n\right)^n$`),
    // trig
    C('trig', R`$180^\circ = $`, R`$\pi$ radians`),
    C('trig', R`$\sin\frac\pi6,\ \cos\frac\pi6$`, R`$\frac12,\ \frac{\sqrt3}{2}$`),
    C('trig', R`$\sin\frac\pi4,\ \cos\frac\pi4$`, R`$\frac{\sqrt2}{2},\ \frac{\sqrt2}{2}$`),
    C('trig', R`$\sin\frac\pi3,\ \cos\frac\pi3$`, R`$\frac{\sqrt3}{2},\ \frac12$`),
    C('trig', R`$\tan\frac\pi6,\ \tan\frac\pi4,\ \tan\frac\pi3$`, R`$\frac{\sqrt3}{3},\ 1,\ \sqrt3$`),
    C('trig', R`$\sin\frac{5\pi}{6},\ \cos\frac{5\pi}{6}$`, R`$\frac12,\ -\frac{\sqrt3}{2}$`),
    C('trig', R`$\sin\frac{4\pi}{3},\ \cos\frac{4\pi}{3}$`, R`$-\frac{\sqrt3}{2},\ -\frac12$`),
    C('trig', R`$\sin\frac{7\pi}{4},\ \cos\frac{7\pi}{4}$`, R`$-\frac{\sqrt2}{2},\ \frac{\sqrt2}{2}$`),
    C('trig', R`$\sin\frac{3\pi}{2},\ \cos\pi$`, R`$-1,\ -1$`),
    C('trig', R`ASTC`, R`QI all positive; QII sin; QIII tan; QIV cos`),
    C('trig', R`Pythagorean identity (sin, cos)`, R`$\sin^2x + \cos^2x = 1$`),
    C('trig', R`$1 + \tan^2 x = $`, R`$\sec^2 x$`),
    C('trig', R`$1 + \cot^2 x = $`, R`$\csc^2 x$`),
    C('trig', R`$\sin 2x = $`, R`$2\sin x\cos x$`),
    C('trig', R`$\cos 2x = $ (three forms)`, R`$\cos^2 x - \sin^2 x = 2\cos^2x - 1 = 1 - 2\sin^2 x$`),
    C('trig', R`$\sin^2 x = $ (power-reducing)`, R`$\dfrac{1 - \cos 2x}{2}$`),
    C('trig', R`$\cos^2 x = $ (power-reducing)`, R`$\dfrac{1 + \cos 2x}{2}$`),
    C('trig', R`$\sin(a \pm b) = $`, R`$\sin a\cos b \pm \cos a \sin b$`),
    C('trig', R`$\cos(a \pm b) = $`, R`$\cos a\cos b \mp \sin a\sin b$`),
    C('trig', R`Range of $\arcsin$`, R`$\left[-\frac\pi2, \frac\pi2\right]$`),
    C('trig', R`Range of $\arccos$`, R`$[0, \pi]$`),
    C('trig', R`Range of $\arctan$`, R`$\left(-\frac\pi2, \frac\pi2\right)$`),
    C('trig', R`Period of $\sin(Bx)$ / $\tan(Bx)$`, R`$\dfrac{2\pi}{|B|}$ / $\dfrac{\pi}{|B|}$`),
    C('trig', R`Arc length / sector area`, R`$s = r\theta$, $A = \frac12 r^2\theta$`),
    C('trig', R`$\sin(\arctan x) = $`, R`$\dfrac{x}{\sqrt{1 + x^2}}$`),
    // series
    C('series', R`$\displaystyle\sum_{i=1}^n i = $`, R`$\dfrac{n(n+1)}{2}$`),
    C('series', R`$\displaystyle\sum_{i=1}^n i^2 = $`, R`$\dfrac{n(n+1)(2n+1)}{6}$`),
    C('series', R`$\displaystyle\sum_{i=1}^n i^3 = $`, R`$\left[\dfrac{n(n+1)}{2}\right]^2$`),
    C('series', R`Infinite geometric series $\sum ar^n$`, R`$\dfrac{a}{1 - r}$ if $|r| &lt; 1$, else diverges`),
    C('series', R`Finite geometric sum ($n$ terms)`, R`$a\dfrac{1 - r^n}{1 - r}$`),
    C('series', R`$n$th term, arithmetic`, R`$a_n = a_1 + (n-1)d$`),
    C('series', R`$\binom nk = $`, R`$\dfrac{n!}{k!\,(n-k)!}$`),
    C('series', R`Riemann sum (right endpoints)`, R`$\sum_{i=1}^n f(a + i\Delta x)\Delta x,\ \Delta x = \frac{b-a}{n}$`),
    // polar
    C('polar', R`Polar → rectangular`, R`$x = r\cos\theta,\ y = r\sin\theta$`),
    C('polar', R`Rectangular → polar`, R`$r^2 = x^2 + y^2,\ \tan\theta = \frac yx$ (check quadrant!)`),
    C('polar', R`Petals of $r = a\cos(n\theta)$`, R`$n$ if $n$ odd, $2n$ if $n$ even`),
    C('polar', R`Magnitude of $\langle a, b\rangle$`, R`$\sqrt{a^2 + b^2}$`),
    C('polar', R`Dot product &amp; perpendicularity`, R`$u_1v_1 + u_2v_2 = |u||v|\cos\theta$; $=0 \iff \perp$`),
    // bridge
    C('bridge', R`Derivative as a limit`, R`$f'(a) = \displaystyle\lim_{h\to0}\frac{f(a+h) - f(a)}{h}$`),
    C('bridge', R`$\displaystyle\lim_{x\to0}\frac{\sin x}{x}$`, R`$1$`),
    C('bridge', R`$\displaystyle\lim_{x\to0}\frac{1 - \cos x}{x}$`, R`$0$`),
    C('bridge', R`Substitution gives $\frac00$`, R`Indeterminate — factor, rationalize, or simplify, then retry`),
    C('bridge', R`Substitution gives $\frac{k}{0},\ k\neq0$`, R`Vertical asymptote: limit is $\pm\infty$ or DNE`),
    C('bridge', R`Continuity at $a$ (3 conditions)`, R`$f(a)$ defined, $\lim_{x\to a}f(x)$ exists, and they're equal`),
  ];
  DECK.forEach((c, i) => { c.id = c.m + ':' + i; });

  const INTERVALS = [0, 0, 1, 3, 7, 16, 35]; // days by box (1..6)
  const now = () => Date.now();
  function cardState(id) {
    const st = U.store.get().cards;
    return st[id] || { box: 1, due: 0 };
  }
  function due(filter) {
    return DECK.filter((c) => (!filter || c.m === filter) && cardState(c.id).due <= now());
  }
  function grade(id, ok) {
    const st = U.store.get().cards;
    const cur = cardState(id);
    const box = ok ? Math.min(6, cur.box + 1) : 1;
    st[id] = { box, due: ok ? now() + INTERVALS[box] * 864e5 : now() };
    U.store.touchStreak();
    U.store.save();
  }
  function boxCounts() {
    const counts = [0, 0, 0, 0, 0, 0];
    DECK.forEach((c) => { counts[cardState(c.id).box - 1]++; });
    return counts;
  }

  global.Flash = { DECK, due, grade, cardState, boxCounts };
})(window);
