// Sequência de renders da B3 com movimento de câmera suave (Ken Burns) e transição cruzada
(function () {
  const stage = document.getElementById('b3-show');
  if (!stage) return;
  const shots = [...stage.querySelectorAll('.shot')];
  const cap = stage.querySelector('.shot-cap');
  const dots = stage.querySelector('.shot-dots');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DUR = 6500;                       // tempo de cada tomada (ms)
  // movimento de cada tomada: [escala inicial, escala final, deslocamento x/y final em %]
  const moves = [
    [1.00, 1.08, -1.2, 0.8],   // aproxima devagar
    [1.10, 1.02, 1.5, -1.0],   // afasta e desliza
    [1.04, 1.12, -2.0, 1.2],   // aproxima no conector
    [1.12, 1.04, 0.0, -1.6]    // sobe a câmera
  ];
  let i = 0, timer = null, anim = null;
  stage.style.setProperty('--dur', DUR + 'ms');

  shots.forEach((s, k) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', s.dataset.t);
    b.addEventListener('click', () => go(k, true));
    dots.appendChild(b);
  });
  const btns = [...dots.children];

  function animate(k) {
    const img = shots[k].querySelector('img');
    const [s0, s1, x, y] = moves[k % moves.length];
    const f = reduce ? 0.7 : 1;           // com "reduzir movimento" no sistema, movimento mais discreto
    const a0 = 1 + (s0 - 1) * f, a1 = 1 + (s1 - 1) * f;
    anim = img.animate(
      [{ transform: `translate3d(0,0,0) scale(${a0})` }, { transform: `translate3d(${x * f}%,${y * f}%,0) scale(${a1})` }],
      { duration: DUR + 1800, easing: 'cubic-bezier(.33,0,.67,1)', fill: 'forwards' }
    );
  }

  function go(k, manual) {
    const prev = i; i = (k + shots.length) % shots.length;
    if (prev !== i) { shots[prev].classList.remove('on'); }
    shots[i].classList.add('on');
    animate(i);
    // legenda
    cap.classList.add('out');
    setTimeout(() => { cap.querySelector('b').textContent = shots[i].dataset.t; cap.querySelector('span').textContent = shots[i].dataset.s; cap.classList.remove('out'); }, 450);
    btns.forEach((b, n) => { b.classList.remove('on'); if (n === i) { void b.offsetWidth; b.classList.add('on'); } });
    clearTimeout(timer); timer = setTimeout(() => go(i + 1), DUR);
  }

  // pausa fora da tela
  new IntersectionObserver(es => {
    if (es[0].isIntersecting) { if (!timer) timer = setTimeout(() => go(i + 1), DUR); }
    else { clearTimeout(timer); timer = null; }
  }).observe(stage);

  // começa assim que a primeira imagem estiver pronta; as outras já vêm carregando
  const first = shots[0].querySelector('img');
  const begin = () => { shots.forEach(s => { const im = s.querySelector('img'); im.loading = 'eager'; }); go(0); };
  if (first.complete) begin(); else first.addEventListener('load', begin, { once: true });
})();
