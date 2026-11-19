/* Lesson content for every module. Math uses $...$ (inline) and $$...$$ (display). */
(function (global) {
  const R = String.raw;

  const MODULES = [
    {
      id: 'algebra', num: 1, title: 'Algebra Mechanics', icon: 'x²',
      tagline: 'The #1 reason students lose points in calculus. Calculus is easy; the algebra after it is not.',
      calc: 'Every derivative and integral ends in algebra: rewriting powers before differentiating, factoring to find critical points, rationalizing to kill 0/0 limits, completing the square to integrate.',
      widgets: ['vertex'],
      sections: [
        { h: 'Exponent laws (memorize cold)', body: R`
          <div class="formula-grid">
            <div>$a^m a^n = a^{m+n}$</div><div>$\dfrac{a^m}{a^n} = a^{m-n}$</div>
            <div>$(a^m)^n = a^{mn}$</div><div>$(ab)^n = a^n b^n$</div>
            <div>$a^{-n} = \dfrac{1}{a^n}$</div><div>$a^0 = 1\ (a\neq 0)$</div>
            <div>$a^{m/n} = \sqrt[n]{a^m} = (\sqrt[n]{a})^m$</div><div>$\sqrt{x} = x^{1/2}$</div>
          </div>
          <p><b>Calculus move:</b> before using the power rule, rewrite everything as $x^n$:</p>
          $$\frac{3}{\sqrt[3]{x^2}} - \frac{4}{x^5} = 3x^{-2/3} - 4x^{-5}$$
          <p>Then $\frac{d}{dx}$ is mechanical: $-2x^{-5/3} + 20x^{-6}$.</p>` },
        { h: 'Factoring toolkit', body: R`
          <ul class="tight">
            <li><b>GCF first, always.</b> $6x^3 - 9x^2 = 3x^2(2x - 3)$</li>
            <li><b>Trinomials:</b> $x^2 + bx + c = (x+p)(x+q)$ where $p+q=b,\ pq=c$</li>
            <li><b>Difference of squares:</b> $a^2 - b^2 = (a-b)(a+b)$</li>
            <li><b>Sum / difference of cubes:</b> $a^3 \pm b^3 = (a \pm b)(a^2 \mp ab + b^2)$ &mdash; "SOAP": Same, Opposite, Always Positive</li>
            <li><b>Grouping:</b> $x^3 + 2x^2 - 9x - 18 = x^2(x+2) - 9(x+2) = (x+2)(x-3)(x+3)$</li>
            <li><b>Fractional / negative exponents</b> (this is how derivative answers look): factor out the <i>smallest</i> power.
              $$x^{1/2} - 3x^{-1/2} = x^{-1/2}(x - 3) = \frac{x-3}{\sqrt{x}}$$</li>
          </ul>` },
        { h: 'Rational expressions & rationalizing', body: R`
          <p>Combine fractions over the LCD; simplify complex fractions by multiplying top and bottom by the LCD of the inner fractions:</p>
          $$\frac{\frac{1}{x+h} - \frac{1}{x}}{h} = \frac{x - (x+h)}{h\,x(x+h)} = \frac{-1}{x(x+h)}$$
          <p>That is literally the derivative of $1/x$ at the last step. <b>Rationalizing</b> uses the conjugate to remove a radical:</p>
          $$\frac{\sqrt{x+9} - 3}{x}\cdot\frac{\sqrt{x+9}+3}{\sqrt{x+9}+3} = \frac{x}{x(\sqrt{x+9}+3)} = \frac{1}{\sqrt{x+9}+3} \xrightarrow{x\to 0} \frac16$$` },
        { h: 'Completing the square', body: R`
          $$ax^2 + bx + c = a\left(x + \frac{b}{2a}\right)^2 + \left(c - \frac{b^2}{4a}\right)$$
          <p>Recipe for $x^2 + bx$: take half of $b$, square it, add and subtract. Vertex is at $x = -\frac{b}{2a}$. You'll use this for circles/conics and for integrals like $\int \frac{dx}{x^2+4x+13}$ (becomes $\int \frac{dx}{(x+2)^2+9}$ &rarr; arctan).</p>` },
        { h: 'Solving equations', body: R`
          <ul class="tight">
            <li><b>Quadratic formula:</b> $x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}$; discriminant $D=b^2-4ac$: $D>0$ two real, $D=0$ one (double), $D<0$ none.</li>
            <li><b>Zero-product property:</b> set the expression $=0$, factor, set each factor $=0$. Never divide both sides by a variable &mdash; you lose solutions.</li>
            <li><b>Radical equations:</b> isolate, square, <i>check for extraneous roots</i>.</li>
            <li><b>Rational equations:</b> multiply by LCD, solve, discard values that zero a denominator.</li>
            <li><b>Absolute value:</b> $|u| = k \Rightarrow u = \pm k$; $|u| &lt; k \Leftrightarrow -k &lt; u &lt; k$; $|u| &gt; k \Leftrightarrow u&lt;-k$ or $u&gt;k$.</li>
          </ul>` },
        { h: 'Inequalities & sign charts', body: R`
          <p>To solve $\dfrac{(x-1)(x+3)}{x-2} \ge 0$: mark critical numbers $-3, 1, 2$ (zeros of top and bottom), test a point in each interval, read off the signs:</p>
          <div class="signchart"><span>$(-\infty,-3)$: $-$</span><span>$(-3,1)$: $+$</span><span>$(1,2)$: $-$</span><span>$(2,\infty)$: $+$</span></div>
          <p>Answer: $[-3, 1] \cup (2, \infty)$ &mdash; $2$ excluded (denominator). <b>In calculus</b> this exact procedure on $f'(x)$ tells you where $f$ increases/decreases, and on $f''(x)$ gives concavity.</p>` },
        { h: 'Polynomial division', body: R`
          <p>Long or synthetic division rewrites an improper rational function as polynomial + proper fraction &mdash; required before integrating, and it gives slant asymptotes.</p>
          $$\frac{x^2 + 3x + 5}{x + 1} = x + 2 + \frac{3}{x+1}$$
          <p><b>Remainder theorem:</b> dividing $p(x)$ by $(x - r)$ leaves remainder $p(r)$.</p>` },
        { h: 'Fatal errors — never make these', body: R`
          <ul class="traps">
            <li>$(a+b)^2 \neq a^2 + b^2$ &nbsp; (it's $a^2 + 2ab + b^2$)</li>
            <li>$\sqrt{a^2 + b^2} \neq a + b$</li>
            <li>$\dfrac{1}{a+b} \neq \dfrac1a + \dfrac1b$</li>
            <li>$\dfrac{x + 3}{x} \neq 3$ &nbsp; (cancel <i>factors</i>, never <i>terms</i>)</li>
            <li>$-x^2 \neq (-x)^2$ &nbsp; (exponent before negation)</li>
            <li>$\sqrt{x^2} = |x|$, not $x$</li>
          </ul>` },
      ],
    },
    {
      id: 'functions', num: 2, title: 'Functions', icon: 'f(x)',
      tagline: 'Calculus is the study of functions. Notation fluency, composition, and inverses are non-negotiable.',
      calc: 'The difference quotient IS the definition of the derivative. Composition is the chain rule. Inverses give you ln, arctan, and inverse-function derivatives.',
      widgets: ['transform'],
      sections: [
        { h: 'Notation & the difference quotient', body: R`
          <p>$f(x+h)$ means "replace every $x$ with $(x+h)$". For $f(x) = x^2 - 3x$:</p>
          $$f(x+h) = (x+h)^2 - 3(x+h) = x^2 + 2xh + h^2 - 3x - 3h$$
          $$\frac{f(x+h) - f(x)}{h} = \frac{2xh + h^2 - 3h}{h} = 2x + h - 3$$
          <p>Let $h \to 0$ and you get $f'(x) = 2x - 3$. That is the whole idea of the derivative &mdash; master this algebra now.</p>` },
        { h: 'Domain & range', body: R`
          <p>Domain killers:</p>
          <ul class="tight"><li>Division: denominator $\neq 0$</li><li>Even roots: radicand $\ge 0$</li><li>Logs: argument $&gt; 0$</li><li>$\tan x$: $x \neq \frac{\pi}{2} + k\pi$</li></ul>
          <p>Example: $f(x) = \dfrac{\sqrt{x+2}}{x - 5}$ has domain $[-2, 5) \cup (5, \infty)$.</p>` },
        { h: 'Composition & decomposition', body: R`
          <p>$(f\circ g)(x) = f(g(x))$: inside first, then outside. For calculus, the reverse skill matters more &mdash; <b>seeing</b> the inside and outside:</p>
          $$h(x) = \sqrt{3x^2 + 1} \quad\Rightarrow\quad \text{outer } f(u) = \sqrt{u},\ \ \text{inner } g(x) = 3x^2 + 1$$
          <p>The chain rule says $h'(x) = f'(g(x))\cdot g'(x)$, and $u$-substitution is the same decomposition run backwards.</p>` },
        { h: 'Inverse functions', body: R`
          <ul class="tight">
            <li>One-to-one (passes the <b>horizontal line test</b>) &rArr; invertible.</li>
            <li>Find $f^{-1}$: write $y = f(x)$, swap $x \leftrightarrow y$, solve for $y$.</li>
            <li>$f(f^{-1}(x)) = x$ and $f^{-1}(f(x)) = x$; the graph reflects over $y = x$.</li>
            <li>Domain of $f$ = range of $f^{-1}$ and vice versa.</li>
            <li>If $(a,b)$ is on $f$, then $(b,a)$ is on $f^{-1}$ &mdash; and slopes become reciprocals: $(f^{-1})'(b) = \dfrac{1}{f'(a)}$.</li>
          </ul>` },
        { h: 'Piecewise, absolute value, symmetry', body: R`
          $$|x| = \begin{cases} x, & x \ge 0 \\ -x, & x &lt; 0 \end{cases}$$
          <p><b>Even:</b> $f(-x) = f(x)$ (symmetric about the $y$-axis: $x^2, \cos x, |x|$). <b>Odd:</b> $f(-x) = -f(x)$ (origin symmetry: $x^3, \sin x, \tan x$). In calculus, $\int_{-a}^{a} \text{odd} = 0$ and $\int_{-a}^{a}\text{even} = 2\int_0^a$.</p>` },
        { h: 'Transformations', body: R`
          $$y = a\,f\big(b(x - h)\big) + k$$
          <ul class="tight">
            <li>$h$: shift right by $h$ (inside &rarr; opposite of what it looks like)</li>
            <li>$k$: shift up by $k$</li>
            <li>$a$: vertical stretch by $|a|$; $a&lt;0$ reflects over the $x$-axis</li>
            <li>$b$: horizontal compression by factor $1/|b|$; $b&lt;0$ reflects over the $y$-axis</li>
          </ul>
          <p>Use the interactive graph below to build intuition &mdash; drag the sliders until you can predict the result before you see it.</p>` },
        { h: 'Average rate of change', body: R`
          $$\frac{\Delta y}{\Delta x} = \frac{f(b) - f(a)}{b - a} = \text{slope of the secant line}$$
          <p>Derivative = the limit of this as the interval shrinks to a point.</p>` },
        { h: 'Parent graphs to recognize instantly', body: R`
          <p>$x,\ x^2,\ x^3,\ \sqrt{x},\ \sqrt[3]{x},\ |x|,\ \frac1x,\ \frac{1}{x^2},\ e^x,\ \ln x,\ \sin x,\ \cos x,\ \tan x,\ \arcsin x,\ \arctan x$. Pick each one in the transformer above and memorize its shape, domain, intercepts, and asymptotes.</p>` },
      ],
    },
    {
      id: 'lines', num: 3, title: 'Lines & Analytic Geometry', icon: '╱',
      tagline: 'Every tangent-line problem ends with point-slope form. Every related-rates problem starts with a geometry formula.',
      calc: 'Tangent lines, linear approximation, normal lines, related rates, and optimization all depend on this module.',
      widgets: ['tangentline'],
      sections: [
        { h: 'Point-slope form (the most-used formula in Calc I)', body: R`
          $$y - y_1 = m(x - x_1)$$
          <p>Tangent line to $f$ at $x = a$: point $(a, f(a))$, slope $m = f'(a)$, so $y = f(a) + f'(a)(x - a)$. That is also the <b>linear approximation</b> $L(x)$.</p>
          <ul class="tight"><li>Slope $m = \dfrac{y_2 - y_1}{x_2 - x_1}$</li><li>Parallel lines: equal slopes</li><li>Perpendicular lines: $m_1 m_2 = -1$ (negative reciprocals) &mdash; normal line slope is $-1/f'(a)$</li><li>Horizontal: $y = c$ (slope 0); vertical: $x = c$ (undefined slope)</li></ul>` },
        { h: 'Distance & midpoint', body: R`
          $$d = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2} \qquad M = \left(\frac{x_1+x_2}{2},\ \frac{y_1+y_2}{2}\right)$$
          <p>Optimization classic: "find the point on $y=\sqrt{x}$ closest to $(3,0)$" &mdash; minimize $d^2$ instead of $d$ (same minimizer, no radical).</p>` },
        { h: 'Circles & conics', body: R`
          <div class="formula-grid">
            <div>Circle: $(x-h)^2 + (y-k)^2 = r^2$</div>
            <div>Parabola: $y = a(x-h)^2 + k$ or $(x-h)^2 = 4p(y-k)$</div>
            <div>Ellipse: $\dfrac{(x-h)^2}{a^2} + \dfrac{(y-k)^2}{b^2} = 1$</div>
            <div>Hyperbola: $\dfrac{(x-h)^2}{a^2} - \dfrac{(y-k)^2}{b^2} = 1$</div>
          </div>
          <p>Given general form $x^2 + y^2 + Dx + Ey + F = 0$, complete the square in $x$ and $y$ to read the center and radius.</p>` },
        { h: 'Geometry formulas for related rates & optimization', body: R`
          <div class="formula-grid">
            <div>Circle: $A = \pi r^2,\ C = 2\pi r$</div>
            <div>Triangle: $A = \tfrac12 bh$; Pythagorean $a^2+b^2=c^2$</div>
            <div>Sphere: $V = \tfrac43\pi r^3,\ S = 4\pi r^2$</div>
            <div>Cylinder: $V = \pi r^2 h,\ S = 2\pi r^2 + 2\pi r h$</div>
            <div>Cone: $V = \tfrac13 \pi r^2 h$</div>
            <div>Box: $V = lwh,\ S = 2(lw + lh + wh)$</div>
          </div>
          <p><b>Similar triangles</b> are the hidden key in the classic cone-filling and shadow problems: corresponding sides are proportional, e.g. $\frac{r}{h} = \frac{R}{H}$.</p>` },
      ],
    },
    {
      id: 'polyrat', num: 4, title: 'Polynomial & Rational Functions', icon: 'p/q',
      tagline: 'End behavior and asymptotes are limits in disguise.',
      calc: 'Horizontal asymptotes = limits at infinity. Vertical asymptotes = infinite limits. Holes = removable discontinuities. Multiplicity predicts sign changes of f′.',
      widgets: ['rational'],
      sections: [
        { h: 'End behavior', body: R`
          <p>Determined by the leading term $a_n x^n$ alone:</p>
          <table class="mini"><tr><th></th><th>$a_n &gt; 0$</th><th>$a_n &lt; 0$</th></tr>
          <tr><td>$n$ even</td><td>&uarr; &hellip; &uarr;</td><td>&darr; &hellip; &darr;</td></tr>
          <tr><td>$n$ odd</td><td>&darr; &hellip; &uarr;</td><td>&uarr; &hellip; &darr;</td></tr></table>
          <p>A degree-$n$ polynomial has at most $n$ real zeros and at most $n-1$ turning points.</p>` },
        { h: 'Zeros & multiplicity', body: R`
          <p>If $(x - r)^m$ is a factor: <b>odd $m$</b> &rarr; graph crosses the $x$-axis at $r$; <b>even $m$</b> &rarr; touches and turns. Higher multiplicity flattens the graph near $r$.</p>
          <p><b>Factor theorem:</b> $p(r) = 0 \iff (x - r)$ is a factor. <b>Rational root theorem:</b> any rational zero of $a_n x^n + \dots + a_0$ has the form $\pm\frac{\text{factor of } a_0}{\text{factor of } a_n}$.</p>` },
        { h: 'Rational functions: holes vs. vertical asymptotes', body: R`
          <p>Factor top and bottom completely, then:</p>
          <ul class="tight">
            <li>Factor that <b>cancels</b> &rarr; <b>hole</b> (removable discontinuity). Plug into the reduced function to get the hole's $y$.</li>
            <li>Factor left in the denominator &rarr; <b>vertical asymptote</b>.</li>
          </ul>
          $$f(x) = \frac{x^2 - 4}{x^2 - x - 2} = \frac{(x-2)(x+2)}{(x-2)(x+1)} \Rightarrow \text{hole at } \left(2, \tfrac43\right),\ \text{VA } x = -1$$` },
        { h: 'Horizontal & slant asymptotes', body: R`
          <p>Compare degrees of numerator ($n$) and denominator ($d$):</p>
          <ul class="tight">
            <li>$n &lt; d$: HA $y = 0$</li>
            <li>$n = d$: HA $y = \dfrac{\text{leading coeff of top}}{\text{leading coeff of bottom}}$</li>
            <li>$n = d + 1$: slant asymptote = quotient from long division</li>
            <li>$n &gt; d+1$: no linear asymptote</li>
          </ul>
          <p>In calculus: $\displaystyle\lim_{x\to\infty}\frac{3x^2 - 1}{5x^2 + x} = \frac35$ &mdash; same rule, now called a limit at infinity. Justify by dividing every term by the highest power of $x$ in the denominator.</p>` },
      ],
    },
    {
      id: 'explog', num: 5, title: 'Exponentials & Logarithms', icon: 'eˣ',
      tagline: 'e and ln run calculus. Log laws turn products into sums, which is how you differentiate monsters.',
      calc: '(eˣ)′ = eˣ, (ln x)′ = 1/x, ∫1/x dx = ln|x|. Logarithmic differentiation, exponential growth ODEs, and L’Hôpital on indeterminate powers all need fluent log algebra.',
      widgets: ['explog'],
      sections: [
        { h: 'The definitions', body: R`
          $$y = \log_b x \iff b^y = x \qquad (b &gt; 0,\ b \ne 1,\ x &gt; 0)$$
          <p>$e \approx 2.71828$, $\ln x = \log_e x$. $e^x$ and $\ln x$ are inverses: $e^{\ln x} = x$ for $x&gt;0$, $\ln(e^x) = x$ for all $x$.</p>
          <p>$e = \displaystyle\lim_{n\to\infty}\left(1 + \frac1n\right)^n$ &mdash; your first important limit.</p>` },
        { h: 'Log laws (memorize cold)', body: R`
          <div class="formula-grid">
            <div>$\ln(ab) = \ln a + \ln b$</div><div>$\ln\!\left(\dfrac ab\right) = \ln a - \ln b$</div>
            <div>$\ln(a^r) = r\ln a$</div><div>$\ln 1 = 0,\quad \ln e = 1$</div>
            <div>$\log_b x = \dfrac{\ln x}{\ln b}$ (change of base)</div><div>$b^x = e^{x\ln b}$</div>
          </div>
          <ul class="traps"><li>$\ln(a + b) \neq \ln a + \ln b$</li><li>$(\ln x)^2 \neq 2\ln x$ &nbsp; (only $\ln(x^2) = 2\ln x$)</li><li>$\dfrac{\ln a}{\ln b} \neq \ln a - \ln b$</li></ul>` },
        { h: 'Expanding logs (logarithmic differentiation prep)', body: R`
          $$\ln\!\left(\frac{x^3\sqrt{x+1}}{(2x-5)^4}\right) = 3\ln x + \tfrac12\ln(x+1) - 4\ln(2x-5)$$
          <p>Differentiating the right side is trivial; differentiating the left side directly is a quotient-rule nightmare.</p>` },
        { h: 'Solving exponential & log equations', body: R`
          <ul class="tight">
            <li>Isolate the exponential, then take $\ln$: $\ 5e^{2x} = 40 \Rightarrow e^{2x} = 8 \Rightarrow x = \frac{\ln 8}{2}$</li>
            <li>Condense logs, then exponentiate: $\ \ln x + \ln(x - 2) = \ln 3 \Rightarrow x(x-2) = 3 \Rightarrow x = 3$ (reject $x=-1$: outside the domain)</li>
            <li>Quadratic in disguise: $e^{2x} - 5e^x + 6 = 0 \Rightarrow (e^x - 2)(e^x - 3) = 0$</li>
          </ul>` },
        { h: 'Growth & decay models', body: R`
          <div class="formula-grid">
            <div>Continuous: $A = A_0 e^{kt}$</div><div>Compound: $A = P\left(1 + \frac rn\right)^{nt}$</div>
            <div>Continuous compounding: $A = Pe^{rt}$</div><div>Half-life $T$: $k = -\dfrac{\ln 2}{T}$</div>
          </div>
          <p>In calculus you'll derive $A = A_0e^{kt}$ as the solution of $\frac{dA}{dt} = kA$: the rate of growth is proportional to the amount.</p>` },
      ],
    },
    {
      id: 'trig', num: 6, title: 'Trigonometry', icon: 'sin',
      tagline: 'The #2 failure point. Radians only. The unit circle and core identities must be instant recall.',
      calc: 'Trig derivatives/integrals, trig substitution, power-reducing integrals, related rates with angles, polar area — all of it assumes instant unit-circle values and identities.',
      widgets: ['unitcircle', 'triggraph'],
      sections: [
        { h: 'Radians', body: R`
          <p>$\pi \text{ rad} = 180^\circ$. Convert: degrees $\times\frac{\pi}{180}$, radians $\times\frac{180}{\pi}$. <b>Calculus only works in radians</b> &mdash; $\frac{d}{dx}\sin x = \cos x$ is false in degrees.</p>
          $$s = r\theta \qquad A_{\text{sector}} = \tfrac12 r^2\theta$$` },
        { h: 'The unit circle', body: R`
          <p>A point at angle $\theta$ on the unit circle is $(\cos\theta, \sin\theta)$; $\tan\theta = \frac{\sin\theta}{\cos\theta}$.</p>
          <table class="mini center"><tr><th>$\theta$</th><th>$0$</th><th>$\frac\pi6$</th><th>$\frac\pi4$</th><th>$\frac\pi3$</th><th>$\frac\pi2$</th></tr>
          <tr><td>$\sin$</td><td>$0$</td><td>$\frac12$</td><td>$\frac{\sqrt2}2$</td><td>$\frac{\sqrt3}2$</td><td>$1$</td></tr>
          <tr><td>$\cos$</td><td>$1$</td><td>$\frac{\sqrt3}2$</td><td>$\frac{\sqrt2}2$</td><td>$\frac12$</td><td>$0$</td></tr>
          <tr><td>$\tan$</td><td>$0$</td><td>$\frac{\sqrt3}3$</td><td>$1$</td><td>$\sqrt3$</td><td>und.</td></tr></table>
          <p><b>Pattern:</b> $\sin$ goes $\frac{\sqrt0}{2}, \frac{\sqrt1}{2}, \frac{\sqrt2}{2}, \frac{\sqrt3}{2}, \frac{\sqrt4}{2}$; $\cos$ is the reverse. Other quadrants: same reference value, sign from <b>ASTC</b> (All, Sine, Tangent, Cosine positive in QI&ndash;QIV).</p>` },
        { h: 'Six functions & right triangles', body: R`
          <div class="formula-grid">
            <div>$\sin = \frac{\text{opp}}{\text{hyp}},\ \cos = \frac{\text{adj}}{\text{hyp}},\ \tan = \frac{\text{opp}}{\text{adj}}$</div>
            <div>$\csc = \frac1{\sin},\ \sec = \frac1{\cos},\ \cot = \frac1{\tan}$</div>
          </div>` },
        { h: 'Identities (memorize cold)', body: R`
          <div class="formula-grid">
            <div><b>Pythagorean</b><br>$\sin^2x + \cos^2x = 1$<br>$1 + \tan^2x = \sec^2x$<br>$1 + \cot^2x = \csc^2x$</div>
            <div><b>Double angle</b><br>$\sin 2x = 2\sin x\cos x$<br>$\cos 2x = \cos^2x - \sin^2x$<br>$\phantom{\cos 2x}= 2\cos^2x - 1 = 1 - 2\sin^2x$</div>
            <div><b>Power-reducing</b> (trig integrals)<br>$\sin^2x = \dfrac{1 - \cos 2x}{2}$<br>$\cos^2x = \dfrac{1 + \cos 2x}{2}$</div>
            <div><b>Sum / difference</b><br>$\sin(a\pm b) = \sin a\cos b \pm \cos a\sin b$<br>$\cos(a \pm b) = \cos a\cos b \mp \sin a \sin b$</div>
            <div><b>Even / odd</b><br>$\sin(-x) = -\sin x,\ \cos(-x) = \cos x$<br>$\tan(-x) = -\tan x$</div>
            <div><b>Cofunction</b><br>$\sin\!\left(\tfrac\pi2 - x\right) = \cos x$</div>
          </div>
          <p>Derive, don't just memorize: divide $\sin^2 + \cos^2 = 1$ by $\cos^2$ to get the second Pythagorean identity; solve $\cos 2x = 1 - 2\sin^2 x$ for $\sin^2x$ to get power-reducing.</p>` },
        { h: 'Graphs: $y = A\sin(B(x - C)) + D$', body: R`
          <p>Amplitude $|A|$, period $\frac{2\pi}{|B|}$ (for $\tan$: $\frac{\pi}{|B|}$), phase shift $C$, midline $y = D$. $\tan x$ has vertical asymptotes at $x = \frac\pi2 + k\pi$; $\sec x$ at the same places; $\csc x$ and $\cot x$ at $x = k\pi$.</p>` },
        { h: 'Inverse trig', body: R`
          <table class="mini"><tr><th>Function</th><th>Range (output)</th></tr>
          <tr><td>$\arcsin x$</td><td>$[-\frac\pi2, \frac\pi2]$</td></tr>
          <tr><td>$\arccos x$</td><td>$[0, \pi]$</td></tr>
          <tr><td>$\arctan x$</td><td>$(-\frac\pi2, \frac\pi2)$</td></tr></table>
          <p><b>Triangle trick</b> (this <i>is</i> trig substitution): $\sin(\arctan x)$ &mdash; let $\theta = \arctan x$, so $\tan\theta = \frac{x}{1}$: opposite $x$, adjacent $1$, hypotenuse $\sqrt{1+x^2}$. Thus $\sin(\arctan x) = \dfrac{x}{\sqrt{1+x^2}}$.</p>
          <ul class="traps"><li>$\arcsin(\sin\frac{5\pi}{6}) = \frac{\pi}{6}$, not $\frac{5\pi}{6}$ (range!)</li><li>$\sin^{-1}x$ means $\arcsin x$, not $\frac{1}{\sin x}$</li></ul>` },
        { h: 'Solving trig equations', body: R`
          <p>$2\sin x - 1 = 0$ on $[0, 2\pi)$: $\sin x = \frac12 \Rightarrow x = \frac\pi6, \frac{5\pi}6$. General solution: $x = \frac\pi6 + 2k\pi$ or $\frac{5\pi}6 + 2k\pi$.</p>
          <p>Factor, don't divide: $\sin x\cos x = \sin x \Rightarrow \sin x(\cos x - 1) = 0$. Dividing by $\sin x$ loses $x = 0, \pi$.</p>
          <p>Law of Sines $\frac{\sin A}{a} = \frac{\sin B}{b}$ and Law of Cosines $c^2 = a^2 + b^2 - 2ab\cos C$ appear in some related-rates problems.</p>` },
      ],
    },
    {
      id: 'series', num: 7, title: 'Sequences, Series & Sums', icon: 'Σ',
      tagline: 'Sigma notation is how integrals are born (Riemann sums) and how Calc II is written.',
      calc: 'Definite integrals are limits of Riemann sums. Calc II series tests, Taylor polynomials, and the binomial expansion behind the power rule all live here.',
      widgets: ['riemann'],
      sections: [
        { h: 'Sigma notation', body: R`
          $$\sum_{i=1}^{n} a_i = a_1 + a_2 + \dots + a_n \qquad \sum (ca_i \pm b_i) = c\sum a_i \pm \sum b_i$$
          <div class="formula-grid">
            <div>$\displaystyle\sum_{i=1}^n c = cn$</div>
            <div>$\displaystyle\sum_{i=1}^n i = \frac{n(n+1)}{2}$</div>
            <div>$\displaystyle\sum_{i=1}^n i^2 = \frac{n(n+1)(2n+1)}{6}$</div>
            <div>$\displaystyle\sum_{i=1}^n i^3 = \left[\frac{n(n+1)}{2}\right]^2$</div>
          </div>` },
        { h: 'Arithmetic & geometric', body: R`
          <div class="formula-grid">
            <div><b>Arithmetic</b>: $a_n = a_1 + (n-1)d$<br>$S_n = \dfrac{n(a_1 + a_n)}{2}$</div>
            <div><b>Geometric</b>: $a_n = a_1 r^{n-1}$<br>$S_n = a_1\dfrac{1 - r^n}{1 - r}$</div>
            <div><b>Infinite geometric</b>: $\displaystyle\sum_{n=0}^\infty a r^n = \frac{a}{1 - r}$ iff $|r| &lt; 1$ (otherwise diverges)</div>
          </div>
          <p>Example: $0.\overline{9} = \frac{9}{10} + \frac{9}{100} + \dots = \frac{9/10}{1 - 1/10} = 1$.</p>` },
        { h: 'Riemann sums preview', body: R`
          <p>Area under $f$ on $[a,b]$ with $n$ rectangles of width $\Delta x = \frac{b-a}{n}$ using right endpoints $x_i = a + i\Delta x$:</p>
          $$\text{Area} \approx \sum_{i=1}^{n} f(x_i)\,\Delta x \xrightarrow{n\to\infty} \int_a^b f(x)\,dx$$
          <p>For $f(x) = x^2$ on $[0,1]$: $\sum \left(\frac in\right)^2\frac1n = \frac{1}{n^3}\cdot\frac{n(n+1)(2n+1)}{6} \to \frac13$. That's why you need the sum formulas. Try the widget below.</p>` },
        { h: 'Binomial theorem & factorials', body: R`
          $$(a + b)^n = \sum_{k=0}^{n}\binom nk a^{n-k}b^k, \qquad \binom nk = \frac{n!}{k!(n-k)!}$$
          <p>Power-rule proof: $(x+h)^n = x^n + nx^{n-1}h + (\text{terms with } h^2)$, so $\frac{(x+h)^n - x^n}{h} \to nx^{n-1}$. Factorials return in Taylor series: $e^x = \sum \frac{x^n}{n!}$.</p>` },
      ],
    },
    {
      id: 'polar', num: 8, title: 'Parametric, Polar & Vectors', icon: 'r,θ',
      tagline: 'Calc II and III territory, but the precalc setup is assumed knowledge.',
      calc: 'Parametric derivatives dy/dx = (dy/dt)/(dx/dt), polar area ½∫r² dθ, arc length, and vector-valued functions in Calc III.',
      widgets: ['polar'],
      sections: [
        { h: 'Parametric equations', body: R`
          <p>$x = f(t),\ y = g(t)$ traces a curve with a direction. <b>Eliminate the parameter</b> by solving for $t$ or using an identity:</p>
          $$x = 3\cos t,\ y = 3\sin t \Rightarrow x^2 + y^2 = 9 \qquad x = t + 1,\ y = t^2 \Rightarrow y = (x-1)^2$$` },
        { h: 'Polar coordinates', body: R`
          <div class="formula-grid">
            <div>$x = r\cos\theta,\quad y = r\sin\theta$</div>
            <div>$r^2 = x^2 + y^2,\quad \tan\theta = \dfrac yx$</div>
          </div>
          <p>Check the quadrant when finding $\theta$! $(-1, 1)$ has $\theta = \frac{3\pi}{4}$, not $\arctan(-1) = -\frac\pi4$.</p>
          <p>Standard curves: $r = a$ (circle), $r = 2a\cos\theta$ (circle through origin), $r = a(1 \pm \cos\theta)$ (cardioid), $r = a + b\cos\theta$ (lima&ccedil;on), $r = a\cos(n\theta)$ (rose: $n$ petals if $n$ odd, $2n$ if even).</p>` },
        { h: 'Vectors', body: R`
          <p>$\vec v = \langle a, b\rangle$, magnitude $|\vec v| = \sqrt{a^2 + b^2}$, unit vector $\frac{\vec v}{|\vec v|}$, dot product $\vec u\cdot\vec v = u_1v_1 + u_2v_2 = |\vec u||\vec v|\cos\theta$. Perpendicular $\iff \vec u\cdot\vec v = 0$.</p>` },
      ],
    },
    {
      id: 'bridge', num: 9, title: 'Bridge to Calculus', icon: 'lim',
      tagline: 'Where precalculus turns into calculus: limits, secants becoming tangents, and indeterminate forms.',
      calc: 'This is Chapter 1–2 of every calculus book. If this module feels natural, Calc I will too.',
      widgets: ['secant'],
      sections: [
        { h: 'Secant → tangent', body: R`
          <p>Slope of the secant through $(a, f(a))$ and $(a+h, f(a+h))$:</p>
          $$m_{\text{sec}} = \frac{f(a + h) - f(a)}{h} \qquad m_{\text{tan}} = \lim_{h \to 0}\frac{f(a+h) - f(a)}{h} = f'(a)$$
          <p>Average rate of change becomes instantaneous rate of change. Drag $h$ toward $0$ in the widget and watch it happen.</p>` },
        { h: 'What a limit means', body: R`
          <p>$\displaystyle\lim_{x\to a} f(x) = L$: $f(x)$ gets arbitrarily close to $L$ as $x$ gets close to $a$ <b>(but $x \neq a$)</b>. The value $f(a)$ is irrelevant &mdash; it can be different or undefined.</p>
          <ul class="tight"><li>Two-sided limit exists iff both one-sided limits exist and agree.</li><li>Continuity at $a$: $\lim_{x\to a}f(x) = f(a)$ (exists, defined, equal).</li></ul>` },
        { h: 'Evaluating limits algebraically', body: R`
          <ol class="tight">
            <li><b>Plug in.</b> If you get a number, done.</li>
            <li><b>$\frac{0}{0}$ is indeterminate</b> &mdash; not 0, not 1, not undefined. It means "do more algebra":
              <ul><li>Factor & cancel: $\displaystyle\lim_{x\to3}\frac{x^2-9}{x-3} = \lim_{x\to 3}(x+3) = 6$</li>
              <li>Rationalize with the conjugate</li>
              <li>Combine complex fractions</li></ul></li>
            <li><b>$\frac{k}{0}$ with $k\neq0$</b> &rarr; vertical asymptote; check signs on each side for $\pm\infty$.</li>
            <li><b>$x \to \infty$</b>: divide by the highest power in the denominator (same as horizontal asymptote rules).</li>
          </ol>` },
        { h: 'Special limits to know', body: R`
          $$\lim_{x\to0}\frac{\sin x}{x} = 1 \qquad \lim_{x\to0}\frac{1 - \cos x}{x} = 0 \qquad \lim_{n\to\infty}\left(1 + \frac1n\right)^n = e$$
          <p>Scaled version: $\lim_{x\to 0}\frac{\sin(kx)}{x} = k$ (multiply and divide by $k$).</p>` },
        { h: 'Your Calc I starter kit', body: R`
          <p>When you get to derivatives, every rule is built from this course: power rule (exponent laws + binomial), product/quotient rule (algebra), chain rule (composition), trig derivatives (unit circle + sum identities + $\frac{\sin x}{x}$), $e^x$ and $\ln x$ (inverses + log laws). Run the <a href="#/exam">Mixed Exam</a> and drill the <a href="#/flashcards">memorize deck</a> until both are automatic.</p>` },
      ],
    },
  ];

  global.MODULES = MODULES;
})(window);
