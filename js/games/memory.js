// ── MEMORY / CONCENTRACIÓN ───────────────────────────────────
function initMemory(con){
  const S={cards:[],flipped:[],matched:0,tries:0,timer:0,interval:null,phase:'setup',size:16};

  function render(){
    con.innerHTML='';const w=document.createElement('div');w.className='gwrap';
    w.innerHTML=S.phase==='setup'?setupHTML():gameHTML();
    con.appendChild(w);bind();
  }

  function setupHTML(){return`
    <div style="max-width:360px;margin:0 auto;width:100%;display:flex;flex-direction:column;gap:12px">
      <div class="slbl">Selecciona dificultad</div>
      ${[{s:16,l:'Fácil',d:'4×4 — 8 pares',c:'#56d364'},{s:24,l:'Medio',d:'4×6 — 12 pares',c:'var(--warn)'},{s:36,l:'Difícil',d:'6×6 — 18 pares',c:'#f85149'}]
        .map(o=>`<div class="diff-opt" data-s="${o.s}" style="background:var(--surf);border:1px solid var(--brd);border-radius:12px;padding:13px 15px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:12px">
          <span style="font-size:1.5rem">🎴</span>
          <div><div style="font-family:var(--fh);font-size:.8rem;color:${o.c}">${o.l}</div><div style="font-size:.72rem;color:var(--tx-m)">${o.d}</div></div>
        </div>`).join('')}
    </div>`;}

  function gameHTML(){return`
    <div style="display:flex;flex-direction:column;gap:10px;flex:1;overflow:hidden">
      <div class="ibar">
        <div style="text-align:center"><span class="ival" id="mem-t">0</span><span class="ilbl">Intentos</span></div>
        <div class="isep"></div>
        <div style="text-align:center"><span class="ival" id="mem-m">0/${S.size/2}</span><span class="ilbl">Pares</span></div>
        <div class="isep"></div>
        <div style="text-align:center"><span class="ival" id="mem-time">0s</span><span class="ilbl">Tiempo</span></div>
      </div>
      <div id="mem-grid" class="mem-grid" style="overflow-y:auto;flex:1"></div>
    </div>`;}

  function bind(){
    document.querySelectorAll('.diff-opt').forEach(o=>{
      o.addEventListener('click',()=>{S.size=+o.dataset.s;startGame();});
    });
  }

  function startGame(){
    clearInterval(S.interval);
    S.tries=0;S.matched=0;S.flipped=[];S.timer=0;S.phase='game';
    const deck=shuffle(buildDeck()).slice(0,S.size/2);
    S.cards=shuffle([...deck,...deck].map((c,i)=>({...c,uid:i})));
    render();
    startTimer();
    renderGrid();
  }

  function startTimer(){
    S.interval=setInterval(()=>{
      S.timer++;
      const e=document.getElementById('mem-time');
      if(e) e.textContent=S.timer+'s';
    },1000);
  }

  function renderGrid(){
    const grid=document.getElementById('mem-grid');if(!grid)return;
    const cols=S.size===36?6:S.size===24?6:4;
    grid.style.gridTemplateColumns=`repeat(${cols},1fr)`;
    S.cards.forEach((c,i)=>{
      const el=document.createElement('div');el.className='mcrd';el.dataset.i=i;
      el.innerHTML=`<div class="mback">🃏</div>
        <div class="mfront ${c.color}">
          <div class="cc tl"><span class="cr2">${c.rank}</span><span class="cs2">${c.sym}</span></div>
          <span class="csc">${c.sym}</span>
          <div class="cc br"><span class="cr2">${c.rank}</span><span class="cs2">${c.sym}</span></div>
        </div>`;
      el.addEventListener('click',()=>flipCard(i,el));
      grid.appendChild(el);
    });
  }

  let _lock=false;
  async function flipCard(i,el){
    if(_lock||S.flipped.includes(i)||el.classList.contains('matched'))return;
    el.classList.add('flip');S.flipped.push(i);
    if(S.flipped.length<2)return;
    _lock=true;S.tries++;
    const [a,b]=S.flipped;
    document.getElementById('mem-t').textContent=S.tries;
    await new Promise(r=>setTimeout(r,700));
    if(S.cards[a].id===S.cards[b].id){
      document.querySelectorAll(`.mcrd[data-i="${a}"],.mcrd[data-i="${b}"]`)
        .forEach(e=>e.classList.add('matched'));
      S.matched++;
      document.getElementById('mem-m').textContent=`${S.matched}/${S.size/2}`;
      if(S.matched===S.size/2){clearInterval(S.interval);setTimeout(endGame,400);}
    } else {
      document.querySelectorAll(`.mcrd[data-i="${a}"],.mcrd[data-i="${b}"]`)
        .forEach(e=>e.classList.remove('flip'));
    }
    S.flipped=[];_lock=false;
  }

  function endGame(){
    const score=Math.max(0,1000-S.tries*10-S.timer*2);
    recordResult('memory','win',{tries:S.tries,time:S.timer,score,size:S.size});
    confetti(40);
    const w=con.querySelector('.gwrap');
    w.innerHTML=`
    <div style="display:flex;flex-direction:column;align-items:center;gap:16px;max-width:360px;margin:0 auto;width:100%">
      <div class="rbanner" style="width:100%">
        <span class="rbig">🎉</span>
        <span class="rtitle">¡Completado!</span>
        <span class="rsub">${S.tries} intentos · ${S.timer} segundos</span>
        <span style="font-family:var(--fd);font-size:1.5rem;color:var(--gold-l)">Puntuación: ${score}</span>
      </div>
      <div class="brow">
        <button class="btn-p" id="mem-again">🔄 Jugar de nuevo</button>
        <button class="btn-s" id="mem-chg">⚙️ Cambiar dificultad</button>
      </div>
    </div>`;
    document.getElementById('mem-again').onclick=startGame;
    document.getElementById('mem-chg').onclick=()=>{S.phase='setup';clearInterval(S.interval);render();};
  }

  render();
  return{id:'memory',destroy(){clearInterval(S.interval);}};
}

function helpMemory(){return`
<h4>Objetivo</h4>
<p>Encontrar todos los pares de cartas iguales en el menor número de intentos y tiempo posible.</p>
<h4>Cómo jugar</h4>
<ul>
  <li>Todas las cartas están boca abajo.</li>
  <li>Toca una carta para voltearla, luego toca otra.</li>
  <li>Si las dos son iguales → quedan visibles (par encontrado ✓).</li>
  <li>Si no son iguales → se voltean de nuevo boca abajo.</li>
  <li>¡Memoriza posiciones para hacer menos intentos!</li>
</ul>
<h4>Puntuación</h4>
<p>Puntuación = 1000 − (intentos × 10) − (segundos × 2). Mínimo 0.</p>
<h4>Dificultades</h4>
<table>
<tr><th>Nivel</th><th>Cartas</th><th>Pares</th></tr>
<tr><td>Fácil</td><td>16</td><td>8</td></tr>
<tr><td>Medio</td><td>24</td><td>12</td></tr>
<tr><td>Difícil</td><td>36</td><td>18</td></tr>
</table>
<div class="tip">💡 Estrategia: empieza por las esquinas y construye un mapa mental de posiciones.</div>`;}
