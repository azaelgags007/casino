// ── PÓKER DE VIDEO — Jacks or Better ────────────────────────
function initPoker(con){
  const PAYS=[
    {name:'Escalera Real',    pay:800, test:isRoyalFlush},
    {name:'Escalera de Color',pay:50,  test:isStraightFlush},
    {name:'Póker (4 iguales)',pay:25,  test:isFourOfAKind},
    {name:'Full House',       pay:9,   test:isFullHouse},
    {name:'Color (Flush)',    pay:6,   test:isFlush},
    {name:'Escalera',         pay:4,   test:isStraight},
    {name:'Trío',             pay:3,   test:isThreeOfAKind},
    {name:'Doble Par',        pay:2,   test:isTwoPair},
    {name:'Par de Jotas+',    pay:1,   test:isJacksOrBetter},
  ];
  const S={deck:[],hand:[],held:[],credits:100,phase:'idle',lastWin:0,lastHandIdx:-1};

  function render(){
    con.innerHTML='';const w=document.createElement('div');w.className='gwrap';
    w.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
        <div class="credits"><span>💰</span><span class="cval" id="pk-cr">${S.credits}</span><span class="clbl">Créditos</span></div>
        <div class="credits"><span>🏆</span><span class="cval" id="pk-lw">${S.lastWin}</span><span class="clbl">Ganado</span></div>
      </div>
      <div class="ptable" id="pk-table"></div>
      <div id="pk-msg" style="font-family:var(--fd);font-size:.95rem;text-align:center;min-height:22px;color:var(--gold-l)"></div>
      <div class="poker-hand" id="pk-hand"></div>
      <div id="pk-hint" style="font-size:.7rem;color:var(--tx-m);text-align:center;min-height:14px">Toca las cartas que quieres conservar (HOLD)</div>
      <div class="brow" id="pk-btns">
        <button class="btn-p" id="pk-deal">🃏 Repartir (−1 crédito)</button>
      </div>`;
    con.appendChild(w);
    renderPayTable();
    document.getElementById('pk-deal').onclick=deal;
  }

  function renderPayTable(){
    const t=document.getElementById('pk-table');if(!t)return;
    t.innerHTML=PAYS.map((p,i)=>`
      <div class="prow ${S.phase==='result'&&S.lastHandIdx===i?'hl':''}">
        <span class="phand">${p.name}</span><span class="pmult">${p.pay}×</span>
      </div>`).join('');
  }

  function deal(){
    if(S.credits<1){toast('Sin créditos','err');showRecharge();return;}
    S.credits--;S.deck=shuffle(buildDeck());
    S.hand=S.deck.splice(0,5);S.held=[];
    S.lastWin=0;S.lastHandIdx=-1;S.phase='hold';
    document.getElementById('pk-cr').textContent=S.credits;
    document.getElementById('pk-lw').textContent=0;
    document.getElementById('pk-msg').textContent='';
    renderHand();renderPayTable();
    document.getElementById('pk-btns').innerHTML=`<button class="btn-p" id="pk-draw">🔄 Cambiar no marcadas</button>`;
    document.getElementById('pk-draw').onclick=drawNew;
    document.getElementById('pk-hint').textContent='Toca las cartas que quieres conservar (HOLD)';
  }

  function renderHand(){
    const hEl=document.getElementById('pk-hand');hEl.innerHTML='';
    S.hand.forEach((c,i)=>{
      const el=mkCard(c,{cp:true});
      if(S.held.includes(i))el.classList.add('held','sel');
      el.style.opacity='0';hEl.appendChild(el);
      setTimeout(()=>{el.classList.add('dealing');el.style.opacity='';},i*100);
      el.addEventListener('click',()=>{
        if(S.phase!=='hold')return;
        if(S.held.includes(i)){S.held=S.held.filter(x=>x!==i);el.classList.remove('held','sel');}
        else{S.held.push(i);el.classList.add('held','sel');}
      });
    });
  }

  function drawNew(){
    for(let i=0;i<5;i++)if(!S.held.includes(i))S.hand[i]=S.deck.splice(0,1)[0];
    S.phase='result';S.held=[];
    renderHand();setTimeout(evaluate,600);
  }

  function evaluate(){
    const idx=PAYS.findIndex(p=>p.test(S.hand));
    S.lastHandIdx=idx;
    if(idx>=0){
      const pay=PAYS[idx].pay;S.lastWin=pay;S.credits+=pay;
      document.getElementById('pk-cr').textContent=S.credits;
      document.getElementById('pk-lw').textContent=pay;
      document.getElementById('pk-msg').textContent=`🏆 ${PAYS[idx].name} — +${pay} créditos`;
      recordResult('poker','win',{hand:PAYS[idx].name,pay});
      if(idx===0)confetti();
    } else {
      document.getElementById('pk-msg').textContent='Sin combinación ganadora';
      recordResult('poker','loss',{});
    }
    renderPayTable();
    document.getElementById('pk-hint').textContent='';
    document.getElementById('pk-btns').innerHTML=`<button class="btn-p" id="pk-deal">🃏 Nueva mano (−1 crédito)</button>`;
    document.getElementById('pk-deal').onclick=deal;
    if(S.credits<=0)showRecharge();
  }

  function showRecharge(){
    const btns=document.getElementById('pk-btns');if(!btns)return;
    const b=document.createElement('button');b.className='btn-s';
    b.textContent='💰 Recargar 100 créditos';
    b.onclick=()=>{S.credits=100;document.getElementById('pk-cr').textContent=100;b.remove();};
    btns.appendChild(b);
  }

  function counts(h){const m={};h.forEach(c=>{m[c.rank]=(m[c.rank]||0)+1;});return Object.values(m).sort((a,b)=>b-a);}
  function isFlush(h){return h.every(c=>c.suit===h[0].suit);}
  function isStraight(h){
    const vals=h.map(c=>c.val===1?14:c.val).sort((a,b)=>a-b);
    const low=h.map(c=>c.val).sort((a,b)=>a-b);
    if(JSON.stringify(low)==='[1,2,3,4,5]')return true;
    return vals[4]-vals[0]===4&&new Set(vals).size===5;
  }
  function isRoyalFlush(h){return isFlush(h)&&isStraight(h)&&h.some(c=>c.rank==='A')&&h.some(c=>c.rank==='K');}
  function isStraightFlush(h){return isFlush(h)&&isStraight(h)&&!isRoyalFlush(h);}
  function isFourOfAKind(h){return counts(h)[0]===4;}
  function isFullHouse(h){const c=counts(h);return c[0]===3&&c[1]===2;}
  function isThreeOfAKind(h){const c=counts(h);return c[0]===3&&c[1]!==2;}
  function isTwoPair(h){const c=counts(h);return c[0]===2&&c[1]===2;}
  function isJacksOrBetter(h){
    const m={};h.forEach(c=>{m[c.rank]=(m[c.rank]||0)+1;});
    return Object.entries(m).some(([r,n])=>n>=2&&['A','K','Q','J'].includes(r));
  }

  render();return S;
}

function helpPoker(){return`
<h4>Objetivo</h4>
<p>Conseguir la mejor mano de 5 cartas. Es "Jacks or Better": necesitas al menos un par de Jotas para ganar.</p>
<h4>Cómo jugar</h4>
<ul>
  <li>Cada mano cuesta 1 crédito. Comienzas con 100.</li>
  <li>Recibes 5 cartas. Toca las que quieres <strong>conservar (HOLD)</strong>.</li>
  <li>Pulsa "Cambiar" — las no marcadas se reemplazan por cartas nuevas.</li>
  <li>La mano resultante determina tu premio.</li>
</ul>
<h4>Tabla de pagos</h4>
<table>
<tr><th>Mano</th><th>Pago</th></tr>
<tr><td>Escalera Real (A-K-Q-J-10 mismo palo)</td><td>800×</td></tr>
<tr><td>Escalera de Color (5 consecutivas mismo palo)</td><td>50×</td></tr>
<tr><td>Póker (4 iguales)</td><td>25×</td></tr>
<tr><td>Full House (trío + par)</td><td>9×</td></tr>
<tr><td>Color / Flush (5 del mismo palo)</td><td>6×</td></tr>
<tr><td>Escalera (5 consecutivas)</td><td>4×</td></tr>
<tr><td>Trío (3 iguales)</td><td>3×</td></tr>
<tr><td>Doble par</td><td>2×</td></tr>
<tr><td>Par de Jotas o mejor (J, Q, K, A)</td><td>1×</td></tr>
</table>
<div class="tip">💡 Con un par de Jotas o mejor conserva ese par. Con 4 cartas de color descarta la quinta.</div>`;}
