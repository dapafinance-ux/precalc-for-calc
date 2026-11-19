/* App shell: routing and views. */
(function () {
  const { h, renderMath, store } = U;
  const app = document.getElementById('app');
  const MOD = Object.fromEntries(MODULES.map((m) => [m.id, m]));

  function setNav(name) {
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === name));
    const n = Flash.due().length;
    const b = document.getElementById('due-badge');
    b.textContent = n ? n : ''; b.style.display = n ? '' : 'none';
  }
  function view(node) {
    Widgets.clearRedraws();
    app.innerHTML = ''; app.appendChild(node); renderMath(app);
    window.scrollTo(0, 0);
  }

  /* ---------------- Home ---------------- */
  function home() {
    setNav('home');
    const st = store.get();
    const totalAttempts = Object.values(st.stats).reduce((a, s) => a + s.attempts, 0);
    const mastered = MODULES.filter((m) => store.mastery(m.id).label === 'Mastered').length;
    const due = Flash.due().length;
    const hero = h('section', { class: 'hero' },
      h('div', null,
        h('p', { class: 'eyebrow' }, 'Precalculus → Calculus'),
        h('h1', { html: 'Everything you must know <em>before</em> calculus.' }),
        h('p', { class: 'lede' }, 'Nine modules, ten interactive graphs, unlimited randomized problems with worked solutions, and a spaced-repetition deck for the formulas you must know cold.'),
        h('div', { class: 'hero-cta' },
          h('a', { class: 'btn', href: '#/m/algebra' }, 'Start with Module 1'),
          h('a', { class: 'btn ghost', href: '#/exam' }, 'Take the diagnostic exam'))),
      h('div', { class: 'stats' },
        stat(`${mastered}/9`, 'modules mastered'),
        stat(String(totalAttempts), 'problems attempted'),
        stat(String(due), 'cards due', '#/flashcards'),
        stat(`${st.streak.count || 0}`, 'day streak')));
    const order = h('p', { class: 'muted small priority' }, h('b', null, 'Priority order if time is short: '), 'Algebra → Trig → Functions → Exp/Log → Rational → the rest. Most calculus points are lost in algebra and trig, not calculus.');
    const grid = h('section', { class: 'grid' }, ...MODULES.map(moduleCard));
    return h('div', { class: 'page' }, hero, order, grid);
  }
  function stat(n, label, href) {
    const inner = [h('div', { class: 'stat-n' }, n), h('div', { class: 'stat-l' }, label)];
    return href ? h('a', { class: 'stat', href }, ...inner) : h('div', { class: 'stat' }, ...inner);
  }
  function moduleCard(m) {
    const ms = store.mastery(m.id);
    return h('a', { class: 'card mod', href: '#/m/' + m.id },
      h('div', { class: 'mod-top' }, h('span', { class: 'mod-num' }, String(m.num).padStart(2, '0')), h('span', { class: 'mod-icon' }, m.icon)),
      h('h3', null, m.title),
      h('p', { class: 'muted small' }, m.tagline),
      h('div', { class: 'bar' }, h('span', { style: `width:${ms.n ? ms.pct : 0}%` })),
      h('div', { class: 'mod-foot small' }, h('span', { class: 'pill ' + ms.label.toLowerCase().replace(' ', '-') }, ms.label), h('span', { class: 'muted' }, ms.n ? `${ms.pct}% recent · ${ms.n} tries` : '')));
  }

  /* ---------------- Module ---------------- */
  function moduleView(id, tab) {
    const m = MOD[id]; if (!m) return home();
    setNav('');
    tab = tab || 'learn';
    const idx = MODULES.indexOf(m);
    const tabs = [['learn', 'Learn'], ['explore', 'Interactive'], ['practice', 'Practice'], ['memorize', 'Memorize']];
    const header = h('header', { class: 'mod-header' },
      h('a', { class: 'back small', href: '#/' }, '← All modules'),
      h('p', { class: 'eyebrow' }, `Module ${m.num}`),
      h('h1', null, m.title),
      h('p', { class: 'lede' }, m.tagline),
      h('div', { class: 'calc-link' }, h('b', null, 'Why calculus needs this: '), m.calc),
      h('nav', { class: 'tabs' }, ...tabs.map(([k, l]) => h('a', { href: `#/m/${id}/${k}`, class: k === tab ? 'active' : '' }, l))));
    let body;
    if (tab === 'learn') body = learn(m);
    else if (tab === 'explore') body = h('div', { class: 'stack' }, ...m.widgets.map((w) => Widgets[w]()));
    else if (tab === 'practice') body = practice([id], { title: m.title });
    else body = flashView(id);
    const prev = MODULES[idx - 1], next = MODULES[idx + 1];
    const pager = h('div', { class: 'pager' },
      prev ? h('a', { class: 'btn ghost', href: '#/m/' + prev.id }, '← ' + prev.title) : h('span'),
      next ? h('a', { class: 'btn ghost', href: '#/m/' + next.id }, next.title + ' →') : h('a', { class: 'btn ghost', href: '#/exam' }, 'Mixed exam →'));
    return h('div', { class: 'page' }, header, body, pager);
  }
  function learn(m) {
    const toc = h('ol', { class: 'toc small' }, ...m.sections.map((s, i) => h('li', null, h('a', { href: 'javascript:void 0', onclick: () => document.getElementById('sec-' + i).scrollIntoView({ behavior: 'smooth', block: 'start' }), html: s.h }))));
    const secs = m.sections.map((s, i) => h('section', { class: 'lesson', id: 'sec-' + i }, h('h2', { html: s.h }), h('div', { class: 'lesson-body', html: s.body })));
    const cta = h('div', { class: 'cta-row' },
      h('a', { class: 'btn', href: `#/m/${m.id}/explore` }, 'Open the interactive graphs'),
      h('a', { class: 'btn ghost', href: `#/m/${m.id}/practice` }, 'Practice problems'));
    return h('div', { class: 'learn' }, h('aside', { class: 'toc-wrap' }, h('div', { class: 'toc-title small muted' }, 'In this module'), toc), h('div', null, ...secs, cta));
  }

  /* ---------------- Practice ---------------- */
  function inputFor(p, onEnter) {
    const mk = (label) => {
      const inp = h('input', { type: 'text', class: 'ans', autocomplete: 'off', spellcheck: 'false', placeholder: label || 'your answer' });
      const prev = h('span', { class: 'preview small muted' });
      inp.addEventListener('input', () => {
        const v = inp.value.trim(); if (!v) { prev.textContent = ''; return; }
        if (MathParse.isUndefWord(v)) { prev.textContent = '→ undefined / none'; return; }
        try {
          if (p.type === 'expr') { MathParse.parse(v); prev.textContent = '✓ parsed'; }
          else if (p.type === 'list') { prev.textContent = '→ ' + v.split(/[;,]/).map((s) => U.num(MathParse.evaluate(s.trim()), 4)).join(', '); }
          else prev.textContent = '= ' + U.num(MathParse.evaluate(v), 5);
        } catch (e) { prev.textContent = '…'; }
      });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); onEnter(); } });
      return { inp, prev };
    };
    if (p.type === 'mc') {
      let chosen = -1;
      const wrap = h('div', { class: 'choices' }, ...p.choices.map((c, i) => {
        const b = h('button', { class: 'choice', html: c, onclick: () => { chosen = i; wrap.querySelectorAll('.choice').forEach((x, j) => x.classList.toggle('sel', j === i)); } });
        return b;
      }));
      return { el: wrap, value: () => chosen, focus: () => {}, lock: () => wrap.querySelectorAll('.choice').forEach((b) => (b.disabled = true)) };
    }
    if (p.type === 'multi') {
      const fields = p.fields.map((f) => ({ f, ...mk(f.label) }));
      const el = h('div', { class: 'multi' }, ...fields.map(({ f, inp, prev }) => h('label', { class: 'mfield' }, h('span', { class: 'mlabel' }, f.label + ' ='), inp, prev)));
      return { el, value: () => fields.map((x) => x.inp.value), focus: () => fields[0].inp.focus(), lock: () => fields.forEach((x) => (x.inp.disabled = true)) };
    }
    const { inp, prev } = mk(p.type === 'list' ? 'e.g. -2, 3' : p.type === 'expr' ? 'expression in x and h' : 'your answer');
    return { el: h('div', { class: 'single' }, inp, prev), value: () => inp.value, focus: () => inp.focus(), lock: () => (inp.disabled = true) };
  }
  function checkAnswer(p, val) {
    switch (p.type) {
      case 'num': return MathParse.checkNumber(val, p.answer);
      case 'expr': return MathParse.checkExpression(val, p.fn, p.vars);
      case 'list': return MathParse.checkList(val, p.answer);
      case 'mc': return val === p.correct;
      case 'multi': return p.fields.every((f, i) => MathParse.checkNumber(val[i], f.answer));
    }
    return false;
  }
  function blank(p, val) {
    if (p.type === 'mc') return val < 0;
    if (p.type === 'multi') return val.some((v) => !String(v).trim());
    return !String(val).trim();
  }
  function practice(moduleIds, opts) {
    const session = { right: 0, total: 0, streak: 0 };
    const score = h('div', { class: 'score small' });
    const box = h('div', { class: 'qbox' });
    const filterSel = moduleIds.length === 1 ? h('select', { class: 'small', onchange: () => next() }, h('option', { value: '' }, 'All problem types'), ...PROBLEMS[moduleIds[0]].map((g) => h('option', { value: g.name }, g.name.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())))) : null;
    const upd = () => { score.innerHTML = `Session: <b>${session.right}/${session.total}</b> &nbsp;·&nbsp; streak <b>${session.streak}</b>`; };
    function next() {
      let p;
      const mid = U.pick(moduleIds);
      if (filterSel && filterSel.value) { const g = PROBLEMS[mid].find((x) => x.name === filterSel.value); p = g(); p.module = mid; } else p = makeProblem(mid);
      box.innerHTML = '';
      let done = false;
      const fb = h('div', { class: 'feedback' });
      const sol = h('div', { class: 'solution hidden' });
      const input = inputFor(p, () => check());
      const checkBtn = h('button', { class: 'btn', onclick: () => check() }, 'Check');
      const hintBtn = h('button', { class: 'btn ghost', onclick: () => { fb.className = 'feedback hint'; fb.innerHTML = '💡 ' + p.hint; renderMath(fb); } }, 'Hint');
      const nextBtn = h('button', { class: 'btn hidden', onclick: () => next() }, 'Next →');
      const giveUp = h('button', { class: 'btn ghost', onclick: () => finish(false, true) }, 'Show solution');
      function check() {
        if (done) { next(); return; }
        const v = input.value();
        if (blank(p, v)) { fb.className = 'feedback warn'; fb.textContent = 'Enter an answer first.'; return; }
        finish(checkAnswer(p, v), false);
      }
      function finish(ok, gaveUp) {
        done = true;
        input.lock();
        store.record(p.module, ok);
        session.total++; if (ok) { session.right++; session.streak++; } else session.streak = 0;
        upd();
        fb.className = 'feedback ' + (ok ? 'ok' : 'bad');
        fb.innerHTML = ok ? '✓ Correct.' : gaveUp ? 'Solution:' : '✗ Not quite. Here is the worked solution:';
        if (p.type === 'mc') box.querySelectorAll('.choice').forEach((b, i) => { if (i === p.correct) b.classList.add('right'); else if (b.classList.contains('sel')) b.classList.add('wrong'); });
        sol.innerHTML = p.sol; sol.classList.remove('hidden'); renderMath(sol);
        checkBtn.classList.add('hidden'); hintBtn.classList.add('hidden'); giveUp.classList.add('hidden'); nextBtn.classList.remove('hidden');
        nextBtn.focus();
      }
      box.append(
        h('div', { class: 'qmeta small muted' }, opts.showModule ? MOD[p.module].title : 'Problem ' + (session.total + 1)),
        h('div', { class: 'question', html: p.q }), input.el,
        h('div', { class: 'btnrow' }, checkBtn, hintBtn, giveUp, nextBtn), fb, sol);
      renderMath(box);
      setTimeout(() => input.focus(), 30);
    }
    upd(); next();
    const help = h('details', { class: 'help small' }, h('summary', null, 'How to type answers'),
      h('div', { html: 'Fractions <code>3/4</code> · roots <code>sqrt(3)/2</code> or <code>√3/2</code> · pi <code>pi</code> or <code>π</code> (e.g. <code>5pi/6</code>) · powers <code>x^2</code> · logs <code>ln(4)/3</code> · lists <code>-2, 3</code> · no value: <code>undefined</code>, <code>none</code>, or <code>diverges</code>. Exact forms are best; decimals need ~3 correct decimal places.' }));
    return h('div', { class: 'practice' }, h('div', { class: 'practice-top' }, score, filterSel), box, help);
  }

  /* ---------------- Flashcards ---------------- */
  function flashView(fixedModule) {
    let filter = fixedModule || '';
    let cram = false;
    let queue = [];
    const wrap = h('div', { class: 'flash' });
    const boxes = h('div', { class: 'boxes' });
    function rebuild() {
      queue = U.shuffle(cram ? Flash.DECK.filter((c) => !filter || c.m === filter) : Flash.due(filter));
      show();
    }
    function drawBoxes() {
      const counts = [0, 0, 0, 0, 0, 0];
      Flash.DECK.filter((c) => !filter || c.m === filter).forEach((c) => counts[Flash.cardState(c.id).box - 1]++);
      const max = Math.max(1, ...counts);
      boxes.innerHTML = '';
      counts.forEach((n, i) => boxes.appendChild(h('div', { class: 'boxcol', title: `Box ${i + 1}: ${n} cards` }, h('div', { class: 'boxbar', style: `height:${(n / max) * 100}%` }), h('span', { class: 'small muted' }, i === 0 ? 'new' : 'B' + (i + 1)), h('span', { class: 'small' }, String(n)))));
    }
    const stage = h('div', { class: 'stage' });
    function show() {
      drawBoxes(); setNav(fixedModule ? '' : 'flashcards');
      stage.innerHTML = '';
      if (!queue.length) {
        stage.appendChild(h('div', { class: 'card empty' }, h('h3', null, 'Nothing due.'), h('p', { class: 'muted' }, 'Every card in this set is scheduled for later. Cram mode reviews everything anyway.'),
          h('button', { class: 'btn', onclick: () => { cram = true; cramChk.checked = true; rebuild(); } }, 'Cram all cards')));
        return;
      }
      const c = queue[0];
      const front = h('div', { class: 'fc-front', html: c.front });
      const back = h('div', { class: 'fc-back hidden', html: c.back });
      const reveal = h('button', { class: 'btn', onclick: () => flip() }, 'Show answer (space)');
      const good = h('button', { class: 'btn ok hidden', onclick: () => gradeIt(true) }, '✓ Knew it (→)');
      const bad = h('button', { class: 'btn bad hidden', onclick: () => gradeIt(false) }, '✗ Missed (←)');
      function flip() { back.classList.remove('hidden'); reveal.classList.add('hidden'); good.classList.remove('hidden'); bad.classList.remove('hidden'); }
      function gradeIt(ok) { Flash.grade(c.id, ok); queue.shift(); if (!ok && !cram) queue.push(c); show(); }
      stage.append(h('div', { class: 'fcard' }, h('div', { class: 'small muted' }, MOD[c.m].title + ` · ${queue.length} left`), front, back), h('div', { class: 'btnrow center' }, reveal, bad, good));
      renderMath(stage);
      stage._keys = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        if (e.key === ' ') { e.preventDefault(); if (!back.classList.contains('hidden')) return; flip(); }
        else if (e.key === 'ArrowRight' && !back.classList.contains('hidden')) gradeIt(true);
        else if (e.key === 'ArrowLeft' && !back.classList.contains('hidden')) gradeIt(false);
      };
    }
    const keyHandler = (e) => { if (!document.body.contains(stage)) { document.removeEventListener('keydown', keyHandler); return; } stage._keys && stage._keys(e); };
    document.addEventListener('keydown', keyHandler);
    const cramChk = h('input', { type: 'checkbox' }); cramChk.addEventListener('change', () => { cram = cramChk.checked; rebuild(); });
    const sel = fixedModule ? null : h('select', { onchange: () => { filter = sel.value; rebuild(); } }, h('option', { value: '' }, 'All modules'), ...MODULES.map((m) => h('option', { value: m.id }, m.title)));
    wrap.append(h('div', { class: 'flash-top' }, sel, h('label', { class: 'check small' }, cramChk, ' Cram mode (ignore schedule)'), boxes), stage,
      h('p', { class: 'small muted' }, 'Leitner spaced repetition: a correct card moves up a box and comes back later (1, 3, 7, 16, 35 days). A miss sends it back to box 1 and repeats it this session.'));
    rebuild();
    return wrap;
  }

  /* ---------------- Mixed exam ---------------- */
  function exam() {
    setNav('exam');
    const page = h('div', { class: 'page' });
    const intro = h('div', { class: 'card exam-intro' },
      h('p', { class: 'eyebrow' }, 'Diagnostic'),
      h('h1', null, 'Mixed Exam'),
      h('p', { class: 'lede' }, 'Random problems across all nine modules with no hints and no feedback until the end. Afterwards you get a per-module breakdown, so you know exactly where to drill.'),
      h('div', { class: 'btnrow' }, ...[18, 27, 36].map((n) => h('button', { class: 'btn' + (n === 18 ? '' : ' ghost'), onclick: () => run(n) }, `${n} questions`))),
      h('p', { class: 'small muted' }, `Best score so far: ${store.get().best.exam != null ? store.get().best.exam + '%' : '—'}`));
    page.appendChild(intro);
    function run(n) {
      const ids = MODULES.map((m) => m.id);
      const list = [];
      for (let i = 0; i < n; i++) list.push(makeProblem(ids[i % ids.length]));
      const qs = U.shuffle(list);
      const answers = [];
      let i = 0; const t0 = Date.now();
      const timer = h('span', { class: 'small muted' });
      const tick = setInterval(() => { if (!document.body.contains(timer)) return clearInterval(tick); const s = Math.round((Date.now() - t0) / 1000); timer.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }, 1000);
      const bar = h('div', { class: 'bar' }, h('span'));
      const box = h('div', { class: 'qbox' });
      page.innerHTML = '';
      page.append(h('div', { class: 'exam-head' }, h('h2', null, 'Mixed Exam'), timer), bar, box);
      function show() {
        bar.firstChild.style.width = (100 * i) / qs.length + '%';
        const p = qs[i];
        const input = inputFor(p, () => go());
        const go = () => { answers[i] = input.value(); i++; if (i < qs.length) show(); else results(); };
        box.innerHTML = '';
        box.append(h('div', { class: 'qmeta small muted' }, `Question ${i + 1} of ${qs.length} · ${MOD[p.module].title}`), h('div', { class: 'question', html: p.q }), input.el,
          h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: go }, i === qs.length - 1 ? 'Finish' : 'Next →'), h('button', { class: 'btn ghost', onclick: () => { input.lock(); answers[i] = p.type === 'mc' ? -1 : ''; i++; if (i < qs.length) show(); else results(); } }, 'Skip')));
        renderMath(box); setTimeout(() => input.focus(), 30);
      }
      function results() {
        clearInterval(tick);
        const per = {}; let right = 0;
        const review = h('div', { class: 'review' });
        qs.forEach((p, k) => {
          const ok = !blank(p, answers[k]) && checkAnswer(p, answers[k]);
          store.record(p.module, ok);
          if (ok) right++;
          per[p.module] = per[p.module] || [0, 0]; per[p.module][1]++; if (ok) per[p.module][0]++;
          const given = p.type === 'mc' ? (answers[k] >= 0 ? p.choices[answers[k]] : '<i>skipped</i>') : p.type === 'multi' ? answers[k].map((v, j) => `${p.fields[j].label} = ${U.h('span', null, v || '—').outerHTML}`).join(', ') : U.h('span', null, answers[k] || '—').outerHTML;
          review.appendChild(h('details', { class: 'rev ' + (ok ? 'ok' : 'bad') }, h('summary', { html: `${ok ? '✓' : '✗'} Q${k + 1} · ${MOD[p.module].title}` }),
            h('div', { class: 'question', html: p.q }), h('div', { class: 'small', html: '<b>Your answer:</b> ' + given }), h('div', { class: 'solution', html: p.sol })));
        });
        const pct = Math.round((100 * right) / qs.length);
        const st = store.get(); if (st.best.exam == null || pct > st.best.exam) { st.best.exam = pct; store.save(); }
        const rows = MODULES.filter((m) => per[m.id]).map((m) => {
          const [a, b] = per[m.id]; const r = a / b;
          return h('tr', null, h('td', null, h('a', { href: `#/m/${m.id}/practice` }, m.title)), h('td', null, `${a}/${b}`), h('td', null, h('div', { class: 'bar thin ' + (r >= 0.8 ? 'good' : r >= 0.5 ? 'mid' : 'low') }, h('span', { style: `width:${r * 100}%` }))));
        });
        const weakest = MODULES.filter((m) => per[m.id]).sort((x, y) => per[x.id][0] / per[x.id][1] - per[y.id][0] / per[y.id][1])[0];
        page.innerHTML = '';
        page.append(h('div', { class: 'card result' }, h('p', { class: 'eyebrow' }, 'Result'), h('div', { class: 'big-score' }, `${pct}%`), h('p', { class: 'muted' }, `${right} of ${qs.length} correct · ${timer.textContent || '0:00'}`),
          weakest && per[weakest.id][0] < per[weakest.id][1] ? h('p', null, 'Drill next: ', h('a', { class: 'btn small', href: `#/m/${weakest.id}/practice` }, weakest.title)) : h('p', null, 'Clean sweep. Run it again; every exam is freshly randomized.'),
          h('table', { class: 'breakdown' }, ...rows),
          h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: () => run(qs.length) }, 'New exam'), h('a', { class: 'btn ghost', href: '#/' }, 'Home'))),
        h('h2', null, 'Review'), review);
        renderMath(page); window.scrollTo(0, 0);
      }
      show();
    }
    return page;
  }

  /* ---------------- Cheat sheet ---------------- */
  function sheet() {
    setNav('sheet');
    const groups = MODULES.map((m) => h('section', { class: 'sheet-group' }, h('h2', null, `${m.num}. ${m.title}`),
      h('dl', null, ...Flash.DECK.filter((c) => c.m === m.id).flatMap((c) => [h('dt', { html: c.front }), h('dd', { html: c.back })]))));
    return h('div', { class: 'page sheet' },
      h('div', { class: 'sheet-head' }, h('div', null, h('p', { class: 'eyebrow' }, 'Reference'), h('h1', null, 'Memorize-Cold Cheat Sheet')), h('button', { class: 'btn ghost', onclick: () => window.print() }, 'Print')),
      h('p', { class: 'muted' }, 'Everything in the flashcard deck on one page. Reading it is not memorizing it; drill the deck until recall is instant.'),
      h('div', { class: 'sheet-grid' }, ...groups));
  }

  /* ---------------- Router ---------------- */
  function route() {
    const parts = (location.hash.replace(/^#\/?/, '') || '').split('/');
    let node;
    if (parts[0] === 'm') node = moduleView(parts[1], parts[2]);
    else if (parts[0] === 'flashcards') { setNav('flashcards'); node = h('div', { class: 'page' }, h('p', { class: 'eyebrow' }, 'Spaced repetition'), h('h1', null, 'Memorize'), flashView(null)); }
    else if (parts[0] === 'exam') node = exam();
    else if (parts[0] === 'sheet') node = sheet();
    else node = home();
    view(node);
  }
  window.addEventListener('hashchange', route);
  document.getElementById('reset-progress').addEventListener('click', () => {
    if (confirm('Erase all saved progress, stats, and flashcard schedules on this device?')) { store.reset(); route(); }
  });
  route();
})();
