// app.js — Bootstrap, registro de juegos, navegación

/* ── UI Helpers ── */
let _tt;
function toast(msg, type='', dur=2600){
  const e = document.getElementById('toast');
  e.textContent = msg;
  e.className = `toast show ${type}`;
  clearTimeout(_tt);
  _tt = setTimeout(() => e.classList.remove('show'), dur);
}

function confetti(n=55){
  const cols = ['#d4af37','#f0d060','#56d364','#f85149','#a371f7','#58a6ff','#fff'];
  for(let i=0; i<n; i++) setTimeout(() => {
    const e = document.createElement('div');
    e.className = 'cp2';
    const s = 5 + Math.random()*8;
    e.style.cssText =
      `left:${10+Math.random()*80}%;top:0;width:${s}px;height:${s}px;` +
      `background:${cols[0|Math.random()*cols.length]};` +
      `border-radius:${Math.random()>.5?'50%':'2px'};` +
      `animation-duration:${1.5+Math.random()*2}s;` +
      `animation-delay:${Math.random()*.4}s`;
    document.body.appendChild(e);
    setTimeout(() => e.remove(), 3600);
  }, i*22);
}

// FIX: usar display en lugar de hidden para evitar conflicto con CSS
function showHelp(title, html){
  document.getElementById('help-title').textContent = title;
  document.getElementById('help-body').innerHTML = html;
  document.getElementById('help-modal').style.display = 'flex';
}
function closeHelp(){
  document.getElementById('help-modal').style.display = 'none';
}

function mkParticles(){
  const c = document.getElementById('particles');
  for(let i=0; i<20; i++){
    const p = document.createElement('div');
    p.className = 'ptcl';
    const s = 2 + Math.random()*4;
    p.style.cssText =
      `left:${Math.random()*100}%;width:${s}px;height:${s}px;` +
      `background:rgba(212,175,55,${.3+Math.random()*.5});` +
      `animation-duration:${5+Math.random()*7}s;animation-delay:${-Math.random()*10}s`;
    c.appendChild(p);
  }
}

/* ── Game Registry ── */
const REGISTRY = [
  {id:'adivina',   name:'Adivina las Cartas', icon:'🃏', badge:'',        init:initAdivina,   help:helpAdivina},
  {id:'blackjack', name:'Blackjack',           icon:'🂱', badge:'',        init:initBlackjack, help:helpBlackjack},
  {id:'memory',    name:'Memory',              icon:'🔲', badge:'',        init:initMemory,    help:helpMemory},
  {id:'cards2048', name:'2048 Cartas',         icon:'🔢', badge:'Nuevo',   init:initCards2048, help:helpCards2048},
  {id:'poker',     name:'Póker de Video',      icon:'🃟', badge:'',        init:initPoker,     help:helpPoker},
  {id:'yahtzee',   name:'Yahtzee',             icon:'🎲', badge:'',        init:initYahtzee,   help:helpYahtzee},
  {id:'ruleta',    name:'Ruleta Europea',      icon:'🎡', badge:'',        init:initRuleta,    help:helpRuleta},
  {id:'slots',     name:'Tragamonedas',        icon:'🎰', badge:'',        init:initSlots,     help:helpSlots},
  {id:'guerra',    name:'Guerra de Cartas',    icon:'⚔️', badge:'',        init:initGuerra,    help:helpGuerra},
  {id:'bingo',     name:'Bingo 75',            icon:'🔵', badge:'',        init:initBingo,     help:helpBingo},
  {id:'solitario', name:'Solitario Klondike',  icon:'🂠', badge:'Clásico', init:initSolitario, help:helpSolitario},
];

let _curGame = null;

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function goLobby(){
  if(_curGame?.destroy) _curGame.destroy();
  _curGame = null;
  showScreen('lobby');
  renderLobby();
}

function goGame(id){
  const g = REGISTRY.find(x => x.id === id);
  if(!g) return;
  document.getElementById('g-title').textContent = g.name;
  showScreen('game');
  const con = document.getElementById('g-container');
  con.innerHTML = '';
  _curGame = g.init(con);
  _curGame.id = id;
}

function renderLobby(){
  const grid = document.getElementById('lobby-grid');
  grid.innerHTML = '';
  const all = loadStats();
  REGISTRY.forEach(g => {
    const st = all[g.id];
    const card = document.createElement('div');
    card.className = 'gcard';
    card.innerHTML =
      `${g.badge ? `<span class="gcard-badge">${g.badge}</span>` : ''}
       <span class="gcard-icon">${g.icon}</span>
       <span class="gcard-name">${g.name}</span>
       <span class="gcard-stat">${st.played ? `${st.played} partidas · ${winRate(st)}% victorias` : 'Sin partidas'}</span>`;
    card.addEventListener('click', () => goGame(g.id));
    grid.appendChild(card);
  });
}

function renderGlobalStats(){
  const all = loadStats();
  const body = document.getElementById('gs-body');
  body.innerHTML = '';
  REGISTRY.forEach(g => {
    const st = all[g.id];
    const wr = winRate(st);
    const d = document.createElement('div');
    d.className = 'gs-card';
    d.innerHTML =
      `<span class="gs-icon">${g.icon}</span>
       <div class="gs-info">
         <div class="gs-name">${g.name}</div>
         <div class="gs-nums">
           <span class="gs-num">Jugadas:<span> ${st.played}</span></span>
           <span class="gs-num">Victorias:<span> ${st.wins}</span></span>
           <span class="gs-num">Racha:<span> ${st.best}</span></span>
         </div>
       </div>
       <div class="gs-wr"><div class="gs-pct">${wr}%</div><div class="gs-plbl">victorias</div></div>`;
    body.appendChild(d);
  });
  const clr = document.createElement('button');
  clr.className = 'btn-d';
  clr.style.marginTop = '14px';
  clr.textContent = '🗑 Borrar todas las estadísticas';
  clr.onclick = () => {
    if(confirm('¿Borrar todas las estadísticas? No se puede deshacer.')){
      clearStats(); renderGlobalStats(); toast('Borradas', 'info');
    }
  };
  body.appendChild(clr);
}

/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
  mkParticles();
  renderLobby();

  document.getElementById('btn-gstats').onclick = () => { renderGlobalStats(); showScreen('gstats'); };
  document.getElementById('btn-back-gs').onclick = () => goLobby();
  document.getElementById('btn-exp').onclick = () => { exportStats(); toast('Exportado', 'ok'); };
  document.getElementById('btn-imp').onclick = () => document.getElementById('imp-file').click();
  document.getElementById('imp-file').addEventListener('change', async e => {
    const f = e.target.files[0]; if(!f) return;
    const r = await importStats(f);
    toast(r.msg, r.ok ? 'ok' : 'err');
    if(r.ok) renderGlobalStats();
    e.target.value = '';
  });

  document.getElementById('btn-home').onclick = () => goLobby();

  document.getElementById('btn-help').onclick = () => {
    const g = REGISTRY.find(x => x.id === _curGame?.id);
    if(g) showHelp(g.name, g.help());
  };

  // FIX: cerrar modal con display:none
  document.getElementById('btn-close-help').onclick = closeHelp;
  document.getElementById('help-modal').addEventListener('click', e => {
    if(e.target === e.currentTarget) closeHelp();
  });

  if('serviceWorker' in navigator)
    navigator.serviceWorker.register('sw.js').catch(() => {});
});
