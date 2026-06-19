// ── YAHTZEE ──────────────────────────────────────────────────
function initYahtzee(con){
  const CATS_DEF=[
    {id:'ones',  name:'Ases',         sec:'up'},
    {id:'twos',  name:'Doses',        sec:'up'},
    {id:'threes',name:'Treses',       sec:'up'},
    {id:'fours', name:'Cuatros',      sec:'up'},
    {id:'fives', name:'Cincos',       sec:'up'},
    {id:'sixes', name:'Seises',       sec:'up'},
    {id:'3kind', name:'Trío',         sec:'dn'},
    {id:'4kind', name:'Póker dados',  sec:'dn'},
    {id:'fh',    name:'Full',         sec:'dn'},
    {id:'ss',    name:'Esc. corta',   sec:'dn'},
    {id:'ls',    name:'Esc. larga',   sec:'dn'},
    {id:'yah',   name:'Yahtzee',      sec:'dn'},
    {id:'chance',name:'Chance',       sec:'dn'},
  ];

  const S={
    dice:Array(5).fill(1),held:[],rolls:0,
    cats:CATS_DEF.map(c=>({...c,score:null})),
    yahtzeeBonus:0
  };

  function calcPot(cat){
    const d=S.dice,sum=d.reduce((a,b)=>a+b,0);
    const cnt={};d.forEach(v=>{cnt[v]=(cnt[v]||0)+1;});
    const vals=Object.values(cnt).sort((a,b)=>b-a);
    switch(cat.id){
      case 'ones':   return d.filter(v=>v===1).length*1;
      case 'twos':   return d.filter(v=>v===2).length*2;
      case 'threes': return d.filter(v=>v===3).length*3;
      case 'fours':  return d.filter(v=>v===4).length*4;
      case 'fives':  return d.filter(v=>v===5).length*5;
      case 'sixes':  return d.filter(v=>v===6).length*6;
      case '3kind':  return vals[0]>=3?sum:0;
      case '4kind':  return vals[0]>=4?sum:0;
      case 'fh':     return(vals[0]===3&&vals[1]===2)?25:0;
      case 'ss':{const uv=[...new Set(d)].sort((a,b)=>a-b);let best=1,cur=1;for(let i=1;i<uv.length;i++){if(uv[i]===uv[i-1]+1)cur++;else cur=1;best=Math.max(best,cur);}return best>=4?30:0;}
      case 'ls':{const uv=[...new Set(d)].sort((a,b)=>a-b);let best=1,cur=1;for(let i=1;i<uv.length;i++){if(uv[i]===uv[i-1]+1)cur++;else cur=1;best=Math.max(best,cur);}return best>=5?40:0;}
      case 'yah':    return vals[0]===5?50:0;
      case 'chance': return sum;
    }return 0;
  }

  function calcTotal(){
    const filled=S.cats.filter(c=>c.score!==null);
    const up=filled.filter(c=>c.sec==='up').reduce((a,c)=>a+c.score,0);
    const dn=filled.filter(c=>c.sec==='dn').reduce((a,c)=>a+c.score,0);
    return up+(up>=63?35:0)+dn+S.yahtzeeBonus;
  }

  function render(){
    con.innerHTML='';const w=document.createElement('div');w.className='gwrap';
    const done=S.cats.filter(c=>c.score!==null).length;
    const upSum=S.cats.filter(c=>c.sec==='up'&&c.score!==null).reduce((a,c)=>a+c.score,0);
    w.innerHTML=`
      <div class="ibar">
        <div style="text-align:center"><span class="ival">${done}/13</span><span class="ilbl">Casillas</span></div>
        <div class="isep"></div>
        <div style="text-align:center"><span class="ival" id="yah-total">${calcTotal()}</span><span class="ilbl">Total</span></div>
        <div class="isep"></div>
        <div style="text-align:center"><span class="ival">${S.rolls}/3</span><span class="ilbl">Tiradas</span></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0">
        <div class="dice-row" id="yah-dice"></div>
        <button class="btn-p" id="yah-roll">🎲 Tirar dados${S.rolls>0?` (${3-S.rolls} restante${3-S.rolls!==1?'s':''})`:''}</button>
        <div style="font-size:.68rem;color:var(--tx-m);text-align:center">Toca los dados que quieres conservar</div>
      </div>
      <div class="slbl">Elige dónde anotar</div>
      <div style="overflow-y:auto;flex:1">
        <div class="yscore-grid" id="yah-up"></div>
        <div class="ysrow ysbonus" style="margin:4px 0">
          <span class="ysname">Bono superior (≥63)</span>
          <span class="ysval">${upSum>=63?'+35':`${upSum}/63`}</span>
        </div>
        <div class="yscore-grid" id="yah-dn"></div>
        ${S.yahtzeeBonus>0?`<div style="text-align:center;font-family:var(--fh);font-size:.68rem;color:var(--gold);margin-top:4px">Bonus Yahtzee extra: +${S.yahtzeeBonus}</div>`:''}
      </div>`;
    con.appendChild(w);
    renderDice();renderScoreCard();
    document.getElementById('yah-roll').onclick=roll;
  }

  function renderDice(){
    const el=document.getElementById('yah-dice');if(!el)return;
    el.innerHTML='';
    S.dice.forEach((v,i)=>{
      const d=document.createElement('div');
      d.className='die'+(S.held.includes(i)?' held':'');
      d.innerHTML=diePips(v);
      if(S.rolls>0)d.onclick=()=>toggleHold(i);
      el.appendChild(d);
    });
    const t=document.getElementById('yah-total');
    if(t)t.textContent=calcTotal();
    const rb=document.getElementById('yah-roll');
    if(rb)rb.disabled=S.rolls>=3;
  }

  function toggleHold(i){
    if(S.rolls===0)return;
    if(S.held.includes(i))S.held=S.held.filter(x=>x!==i);
    else S.held.push(i);
    renderDice();
  }

  function roll(){
    if(S.rolls>=3){toast('Elige una casilla donde anotar','info');return;}
    S.dice=S.dice.map((d,i)=>S.held.includes(i)?d:1+(0|Math.random()*6));
    S.rolls++;
    document.querySelectorAll('.die:not(.held)').forEach(d=>{
      d.classList.add('rolling');setTimeout(()=>d.classList.remove('rolling'),460);
    });
    setTimeout(()=>{renderDice();renderScoreCard();},80);
  }

  function renderScoreCard(){
    const up=document.getElementById('yah-up');
    const dn=document.getElementById('yah-dn');
    if(!up||!dn)return;
    up.innerHTML='';dn.innerHTML='';
    S.cats.forEach(cat=>{
      const pot=S.rolls>0&&cat.score===null?calcPot(cat):null;
      const filled=cat.score!==null;
      const row=document.createElement('div');
      row.className='ysrow'+(filled?' yfilled':S.rolls===0?' ydisabled':'');
      row.innerHTML=`<span class="ysname">${cat.name}</span><span class="ysval">${filled?cat.score:pot!==null?`+${pot}`:'—'}</span>`;
      if(!filled&&S.rolls>0)row.onclick=()=>scoreIt(cat,pot||0);
      (cat.sec==='up'?up:dn).appendChild(row);
    });
  }

  function scoreIt(cat,val){
    if(cat.score!==null||S.rolls===0)return;
    // Extra Yahtzee bonus
    if(cat.id==='yah'&&cat.score===50&&calcPot({id:'yah'})===50)S.yahtzeeBonus+=100;
    cat.score=val;S.rolls=0;S.held=[];S.dice=Array(5).fill(1);
    const done=S.cats.every(c=>c.score!==null);
    if(done){
      const total=calcTotal();
      recordResult('yahtzee','win',{score:total});
      showFinal(total);
    } else render();
  }

  function showFinal(total){
    const w=con.querySelector('.gwrap');
    w.innerHTML=`
    <div style="display:flex;flex-direction:column;align-items:center;gap:16px;max-width:360px;margin:0 auto;width:100%">
      <div class="rbanner" style="width:100%">
        <span class="rbig">🎲</span>
        <span class="rtitle">¡Partida terminada!</span>
        <span style="font-family:var(--fd);font-size:2rem;color:var(--gold-l)">${total} puntos</span>
        <span class="rsub">${total>=250?'¡Puntuación excelente!':total>=150?'¡Bien jugado!':'Sigue practicando'}</span>
      </div>
      <button class="btn-p" id="yah-new" style="width:100%">🎲 Nueva partida</button>
    </div>`;
    confetti(35);
    document.getElementById('yah-new').onclick=()=>{
      Object.assign(S,{dice:Array(5).fill(1),held:[],rolls:0,cats:CATS_DEF.map(c=>({...c,score:null})),yahtzeeBonus:0});
      render();
    };
  }

  render();return S;
}

function helpYahtzee(){return`
<h4>Objetivo</h4>
<p>Conseguir la mayor puntuación posible anotando combinaciones de dados en 13 casillas.</p>
<h4>Cómo jugar</h4>
<ul>
  <li>Cada turno tienes hasta <strong>3 tiradas</strong>.</li>
  <li>Toca los dados que quieres <strong>conservar</strong> entre tiradas.</li>
  <li>Al terminar de tirar, elige una casilla donde anotar. Cada casilla se usa <strong>solo una vez</strong>.</li>
  <li>Puedes anotar 0 en cualquier casilla si no conviene otra opción.</li>
</ul>
<h4>Sección superior</h4>
<table>
<tr><th>Casilla</th><th>Puntos</th></tr>
<tr><td>Ases → Seises</td><td>Suma de dados de ese valor</td></tr>
<tr><td>Bono (≥63 puntos arriba)</td><td>+35 puntos</td></tr>
</table>
<h4>Sección inferior</h4>
<table>
<tr><th>Combinación</th><th>Puntos</th></tr>
<tr><td>Trío (3 iguales)</td><td>Suma de todos</td></tr>
<tr><td>Póker de dados (4 iguales)</td><td>Suma de todos</td></tr>
<tr><td>Full (3+2)</td><td>25</td></tr>
<tr><td>Escalera corta (4 consecutivos)</td><td>30</td></tr>
<tr><td>Escalera larga (5 consecutivos)</td><td>40</td></tr>
<tr><td>Yahtzee (5 iguales)</td><td>50</td></tr>
<tr><td>Yahtzee extra</td><td>+100 c/u</td></tr>
<tr><td>Chance (cualquier cosa)</td><td>Suma de todos</td></tr>
</table>
<div class="tip">💡 Intenta llegar a 63 en la sección superior para obtener el bono de +35.</div>`;}
