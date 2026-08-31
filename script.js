// ---------- Calculator ----------
const inputA = document.getElementById('inputA');
const inputB = document.getElementById('inputB');
const resultBox = document.getElementById('result');
const addBtn = document.getElementById('addBtn');
const checkBtn = document.getElementById('checkBtn');
const versionBadge = document.getElementById('versionBadge');

// Flips true once the fix is applied (via the "Update to 1.0.1" button, or set true by default if you've already shipped it).
let FIX_DEPLOYED = false;

// Remembers the last inputs so "Update to 1.0.1" can recompute without the user retyping.
let lastInputs = null;
let lastResult = null;

function computeAdd(a, b){
  const numA = Number(a);
  const numB = Number(b);

  if (a === '' || b === '' || Number.isNaN(numA) || Number.isNaN(numB)){
    return { ok:false, message: 'Enter two integers.' };
  }

  if (!FIX_DEPLOYED && (numA < 0 || numB < 0)){
    return {
      ok:false,
      message: 'Error: Execution Failed',
      sub: 'Production bug: negative integers are not supported in Version 1.0.',
      wasNegativeBug: true
    };
  }

  return { ok:true, value: numA + numB };
}

function render(){
  const a = inputA.value.trim();
  const b = inputB.value.trim();
  lastInputs = { a, b };
  const res = computeAdd(a, b);
  lastResult = res;

  resultBox.classList.remove('ok', 'err', 'show');

  requestAnimationFrame(() => {
    if (res.ok){
      resultBox.classList.add('ok');
      resultBox.innerHTML = `${a} + ${b} = <strong>${res.value}</strong><div class="check-output" id="checkOutput"></div>`;
    } else {
      resultBox.classList.add('err');
      resultBox.innerHTML = `${res.message}${res.sub ? `<span class="sub">${res.sub}</span>` : ''}<div class="check-output" id="checkOutput"></div>`;
    }
    resultBox.classList.add('show');
  });

  return res;
}

function runCheck(){
  const res = render(); // always (re)compute against the current inputs first
  checkBtn.disabled = true;
  const originalLabel = checkBtn.querySelector('span').textContent;
  checkBtn.querySelector('span').textContent = 'Checking…';

  setTimeout(() => {
    checkBtn.disabled = false;
    checkBtn.querySelector('span').textContent = originalLabel;

    const checkOutput = document.getElementById('checkOutput');
    if (!checkOutput) return;

    if (res.ok){
      checkOutput.innerHTML = `<span class="verify ok-text">Verified — matches the fixed logic in production.</span>`;
      highlightNode(FIX_DEPLOYED ? '4cb9947' : '9edf35d');
    } else if (res.wasNegativeBug){
      checkOutput.innerHTML = `
        <span class="verify err-text">Verified — this is the known bug fixed on branch <span class="mono">bugfix/negative-integers</span>.</span>
        <button type="button" class="update-btn" id="updateBtn">Update to Version 1.0.1</button>
      `;
      highlightNode('528a4f3');
      document.getElementById('updateBtn').addEventListener('click', applyFix);
    } else {
      checkOutput.innerHTML = `<span class="verify err-text">Enter two integers before checking.</span>`;
    }
    checkOutput.classList.add('show');
    scrollToGraph();
  }, 500);
}

function applyFix(){
  FIX_DEPLOYED = true;
  updateBadge();

  const checkOutput = document.getElementById('checkOutput');
  if (checkOutput) checkOutput.innerHTML = `<span class="verify ok-text">Fix applied — recalculating with Version 1.0.1…</span>`;

  highlightNode('4cb9947');

  setTimeout(() => {
    if (lastInputs){ inputA.value = lastInputs.a; inputB.value = lastInputs.b; }
    render();
  }, 550);
}

function scrollToGraph(){
  const section = document.getElementById('graphSection');
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function updateBadge(){
  if (FIX_DEPLOYED){
    versionBadge.textContent = 'Production Fixed (Version 1.0.1)';
    versionBadge.classList.add('fixed');
  } else {
    versionBadge.textContent = 'Production (Version 1.0)';
    versionBadge.classList.remove('fixed');
  }
}

// Ripple helper — the one flowy touch that responds to the user's own click
function ripple(btn, e){
  const rect = btn.getBoundingClientRect();
  const el = document.createElement('span');
  el.className = 'ripple';
  const size = Math.max(rect.width, rect.height);
  el.style.width = el.style.height = `${size}px`;
  el.style.left = `${e.clientX - rect.left - size / 2}px`;
  el.style.top = `${e.clientY - rect.top - size / 2}px`;
  btn.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

addBtn.addEventListener('click', (e) => { ripple(addBtn, e); render(); });
checkBtn.addEventListener('click', (e) => { ripple(checkBtn, e); runCheck(); });

updateBadge();

// ---------- Git graph ----------
const graphNodes = {}; // hash -> <g> element, for highlightNode()

function highlightNode(hash){
  Object.values(graphNodes).flat().forEach(el => el.classList.remove('pulse'));
  const els = graphNodes[hash];
  if (!els) return;
  els.forEach(el => {
    el.classList.add('pulse');
    setTimeout(() => el.classList.remove('pulse'), 1800);
  });
}

(function drawGraph(){
  const svg = document.getElementById('graphSvg');
  if (!svg) return;
  const svgNS = 'http://www.w3.org/2000/svg';

  const mainY = 70, bugfixY = 150, devY = 230;
  const colors = { main: '#2563eb', bugfix: '#f59e0b', dev: '#8b5cf6' };

  const nodes = [
    { x:70,  y:mainY,   color:colors.main,   hash:'9edf35d', refs:['main'], msg:'Initial calculator with addition' },
    { x:280, y:bugfixY, color:colors.bugfix, hash:'528a4f3', refs:['bugfix/negative-integers'], msg:'Fix negative integer handling' },
    { x:280, y:devY,    color:colors.dev,    hash:'06c208c', refs:['dev'], msg:'Add subtraction functionality' },
    { x:480, y:mainY,   color:colors.main,   hash:'528a4f3', refs:['main'], msg:'Fast-forwarded to production', ghost:true },
    { x:590, y:devY,    color:colors.dev,    hash:'4cb9947', refs:['dev','HEAD'], msg:"Merge 'main' into dev" },
  ];

  const paths = [
    { d:`M70,${mainY} C 160,${mainY} 190,${bugfixY} 280,${bugfixY}`, color:colors.bugfix },
    { d:`M70,${mainY} C 160,${mainY} 190,${devY} 280,${devY}`,       color:colors.dev },
    { d:`M280,${bugfixY} C 380,${bugfixY} 420,${mainY} 480,${mainY}`, color:colors.main },
    { d:`M480,${mainY} C 530,${mainY} 550,${devY} 590,${devY}`,      color:colors.main },
    { d:`M280,${devY} C 400,${devY} 480,${devY} 590,${devY}`,        color:colors.dev },
  ];

  paths.forEach((p, i) => {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', p.d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', p.color);
    path.setAttribute('stroke-width', '2.5');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('opacity', '0.85');
    svg.appendChild(path);

    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    path.style.transition = `stroke-dashoffset 0.7s ease ${0.15 * i}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      path.style.strokeDashoffset = '0';
    }));
  });

  nodes.forEach((n, i) => {
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', 'node');
    g.style.opacity = '0';
    g.style.transition = `opacity 0.4s ease ${0.15 * i + 0.3}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => { g.style.opacity = '1'; }));

    const halo = document.createElementNS(svgNS, 'circle');
    halo.setAttribute('class', 'halo');
    halo.setAttribute('cx', n.x); halo.setAttribute('cy', n.y); halo.setAttribute('r', 16);
    halo.setAttribute('fill', n.color);
    g.appendChild(halo);

    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', n.x); circle.setAttribute('cy', n.y);
    circle.setAttribute('r', n.ghost ? 5 : 7);
    circle.setAttribute('fill', n.ghost ? '#fff' : n.color);
    circle.setAttribute('stroke', n.color);
    circle.setAttribute('stroke-width', n.ghost ? 2 : 0);
    g.appendChild(circle);

    const above = n.y === mainY;
    const hashY = above ? n.y - 34 : n.y + 46;
    const msgY = above ? n.y - 18 : n.y + 30;
    const refY = above ? n.y - 50 : n.y + 62;

    const hashText = document.createElementNS(svgNS, 'text');
    hashText.setAttribute('x', n.x); hashText.setAttribute('y', hashY);
    hashText.setAttribute('text-anchor', 'middle');
    hashText.setAttribute('class', 'commit-hash');
    hashText.setAttribute('fill', n.color);
    hashText.textContent = n.hash;
    g.appendChild(hashText);

    const msgText = document.createElementNS(svgNS, 'text');
    msgText.setAttribute('x', n.x); msgText.setAttribute('y', msgY);
    msgText.setAttribute('text-anchor', 'middle');
    msgText.setAttribute('class', 'commit-msg');
    msgText.textContent = n.msg.length > 26 ? n.msg.slice(0,24) + '…' : n.msg;
    g.appendChild(msgText);

    n.refs.forEach((ref, ri) => {
      const tagY = refY + (above ? -ri * 14 : ri * 14);
      const tag = document.createElementNS(svgNS, 'text');
      tag.setAttribute('x', n.x); tag.setAttribute('y', tagY);
      tag.setAttribute('text-anchor', 'middle');
      tag.setAttribute('class', 'ref-tag');
      tag.setAttribute('fill', '#64748b');
      tag.textContent = ref;
      g.appendChild(tag);
    });

    const title = document.createElementNS(svgNS, 'title');
    title.textContent = `${n.hash} — ${n.msg}\nrefs: ${n.refs.join(', ')}`;
    g.appendChild(title);

    svg.appendChild(g);

    if (!graphNodes[n.hash]) graphNodes[n.hash] = [];
    graphNodes[n.hash].push(g);
  });
})();