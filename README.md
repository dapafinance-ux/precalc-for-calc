# Precalc → Calc

An interactive web app covering every precalculus concept you need before calculus.

**Live site:** https://dapafinance-ux.github.io/precalc-for-calc/

## What's inside

- **9 modules**, in priority order of where calculus points are actually lost:
  1. Algebra Mechanics
  2. Functions
  3. Lines & Analytic Geometry
  4. Polynomial & Rational Functions
  5. Exponentials & Logarithms
  6. Trigonometry
  7. Sequences, Series & Sums
  8. Parametric, Polar & Vectors
  9. Bridge to Calculus (limits, secant → tangent)
- **10 interactive graphs:**
  - completing the square
  - function transformations
  - tangent lines
  - rational functions (holes and asymptotes)
  - exponentials and logs as inverses
  - unit circle
  - trig graphs
  - Riemann sums
  - polar curves
  - secant → tangent
- **62 randomized problem generators.** Every problem has a hint and a worked solution. Answers are checked numerically, so `sqrt(3)/2`, `√3/2`, and `0.866` are all accepted. Difference quotients are checked as expressions.
- **Spaced-repetition flashcards** (Leitner boxes) for the 90+ formulas you must know cold.
- **Mixed diagnostic exam** with a per-module breakdown and a full review of every answer.
- **Printable cheat sheet.**

Progress is saved in the browser's `localStorage`.

## Tech

The app is static HTML, CSS, and vanilla JS with no build step. KaTeX is vendored in `vendor/katex`. Graphs are drawn on canvas by a small custom plotter (`js/graph.js`), and a safe expression parser (`js/mathparse.js`) checks answers without using `eval`.

Run it locally with:

```bash
python3 -m http.server
```
