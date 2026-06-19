// ── SOLITARIO KLONDIKE ───────────────────────────────────────
function initSolitario(con){
  const S={
    stock:[],waste:[],found:[[],[],[],[]],
    tableau:[[],[],[],[],[],[],[]],
    score:0,moves:0,mode:1,timer:0,interval:null,
    history:[],phase:'setup'
  };

  function render(){
    con.innerHTML='';
    if(S.phase==='setup'){
      const w=document.createElement('div');w.className='gwrap';
      w.innerHTML=`
      <div style="max-width:360px;margin:0 auto;width:100%;display:flex;flex-direction:column;gap:14px">
        <div class="slbl">Modo de volteo del mazo</div>
        ${[
          {m:1,l:'Volteo de 1 carta', d:'Más fácil — ves una carta a la vez',c:'#56d364'},
          {m:3,l:'Volteo de 3 cartas',d:'Más difícil — ves de 3 en 3',        c:'#f85149'},
        ].map(o=>`
          <div class="diff-opt" data-m="${o.m}" style="background:var(--surf);border:1px solid var(--brd);border-radius:12px;padding:13px 15px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:12px">
            <span style="font-size:1.5rem">🂠</span>
            <div><div style="font-family:var(--fh);font-size:.8rem;color:${o.c}">${o.l}</div>
            <div style="font-size:.72rem;color:var(--tx-m)">${o.d}</div></div>
          </div>`).join('')}
      </div>`;
      con.appendChild(w);
      document.querySelectorAll('.diff-opt').forEach(o=>{
        o.onclick=()=>{S.mode=+o.dataset.m;newGame();};
      });
      return;
    }
    renderTable();
  }

  function newGame(){
    clearInterval(S.interval);
    const deck=shuffle(buildDeck());
    S.score=0;S.moves=0;S.timer=0;S.history=[];
    S.found=[[],[],[],[]];
    S.tableau=Array.from({length:7},()=>[]);
    let idx=0;
    for(let col=0;col<7;col++)
      for(let row=0;row<=col;row++)
        S.tableau[col].push({...deck[idx++],up:row===col});
    S.stock=deck.slice(idx).map(c=>({...c,up:false}));
    S.waste=[];S.phase='play';
    render();startTimer();
  }

  function startTimer(){
    S.interval=setInterval(()=>{
      S.timer++;
      const e=document.getElementById('sol-time');
      if(e)e.textContent=S.timer+'s';
    },1000);
  }

  function renderTable(){
    con.innerHTML='';
    const table=document.createElement('div');
    table.className='sol-table';

    // ── TOP ROW ──
    const top=document.createElement('div');top.className='sol-top';

    // Stock
    const stockW=document.createElement('div');stockW.style.flexShrink='0';
    if(S.stock.length){
      const el=mkCard(S.stock[S.stock.length-1],{fd:true});
      el.style.cursor='pointer';el.onclick=drawStock;
      stockW.appendChild(el);
    } else {
      const emp=document.createElement('div');
      emp.className='sol-ph';emp.textContent='↺';emp.style.cursor='pointer';
      emp.onclick=resetStock;stockW.appendChild(emp);
    }
    top.appendChild(stockW);

    // Waste
    const wasteW=document.createElement('div');wasteW.style.flexShrink='0';
    if(S.waste.length){
      const wc=S.waste[S.waste.length-1];
      const el=mkCard(wc);el.style.cursor='pointer';
      el.onclick=()=>moveFromWaste();
      wasteW.appendChild(el);
    } else {
      const emp=document.createElement('div');emp.style.cssText=`width:var(--cw);height:var(--ch)`;
      wasteW.appendChild(emp);
    }
    top.appendChild(wasteW);

    // Spacer
    const sp=document.createElement('div');sp.style.flex='1';top.appendChild(sp);

    // Foundations
    const fW=document.createElement('div');fW.className='sol-founds';
    const FSYMS=['♠','♥','♦','♣'];
    S.found.forEach((f,fi)=>{
      const fw=document.createElement('div');fw.style.flexShrink='0';
      if(f.length){
        const el=mkCard(f[f.length-1]);
        el.onclick=()=>autoFoundation();
        fw.appendChild(el);
      } else {
        const ph=document.createElement('div');ph.className='sol-ph';
        ph.innerHTML=`<span style="color:${fi>=2?'var(--red)':'var(--tx-m)'}">${FSYMS[fi]}</span>`;
        ph.onclick=()=>autoFoundation();
        fw.appendChild(ph);
      }
      fW.appendChild(fw);
    });
    top.appendChild(fW);
    table.appendChild(top);

    // Info bar
    const ib=document.createElement('div');ib.className='ibar';ib.style.flexShrink='0';
    ib.innerHTML=`
      <div style="text-align:center"><span class="ival">${S.score}</span><span class="ilbl">Puntos</span></div>
      <div class="isep"></div>
      <div style="text-align:center"><span class="ival" id="sol-time">${S.timer}s</span><span class="ilbl">Tiempo</span></div>
      <div class="isep"></div>
      <div style="text-align:center"><span class="ival">${S.moves}</span><span class="ilbl">Movs</span></div>`;
    table.appendChild(ib);

    // Tableau
    const tab=document.createElement('div');tab.className='sol-tableau';
    S.tableau.forEach((col,ci)=>{
      const colEl=document.createElement('div');colEl.className='sol-col';colEl.dataset.col=ci;
      if(!col.length){
        const ph=document.createElement('div');ph.className='sol-ph';ph.textContent='K';
        colEl.appendChild(ph);
      }
      col.forEach((c,ri)=>{
        const el=mkCard(c,{fd:!c.up,cp:c.up});
        if(ri>0)el.style.marginTop='-68px';
        if(c.up){el.addEventListener('click',()=>clickCard(ci,ri));}
        else if(ri===col.length-1){el.addEventListener('click',()=>{col[ri].up=true;addScore(5);renderTable();});}
        colEl.appendChild(el);
      });
      tab.appendChild(colEl);
    });
    table.appendChild(tab);

    // Buttons
    const btns=document.createElement('div');btns.className='brow';btns.style.flexShrink='0';
    btns.innerHTML=`
      <button class="btn-p"  id="sol-new">🔄 Nueva</button>
      <button class="btn-s"  id="sol-undo">↩ Deshacer</button>
      <button class="btn-s"  id="sol-back">⚙️ Modo</button>`;
    table.appendChild(btns);
    con.appendChild(table);

    document.getElementById('sol-new').onclick=newGame;
    document.getElementById('sol-undo').onclick=undo;
    document.getElementById('sol-back').onclick=()=>{clearInterval(S.interval);S.phase='setup';render();};
  }

  function drawStock(){
    saveH();
    if(S.mode===1){const c=S.stock.pop();c.up=true;S.waste.push(c);}
    else{for(let i=0;i<3&&S.stock.length;i++){const c=S.stock.pop();c.up=true;S.waste.push(c);}}
    S.moves++;renderTable();
  }

  function resetStock(){
    saveH();
    S.stock=[...S.waste].reverse().map(c=>({...c,up:false}));
    S.waste=[];S.score=Math.max(0,S.score-100);S.moves++;
    renderTable();
  }

  function moveFromWaste(){
    if(!S.waste.length)return;
    const c=S.waste[S.waste.length-1];
    for(let fi=0;fi<4;fi++){
      if(canFound(c,fi)){saveH();S.waste.pop();S.found[fi].push(c);addScore(10);S.moves++;renderTable();checkWin();return;}
    }
    for(let ci=0;ci<7;ci++){
      if(canTab(c,ci)){saveH();S.waste.pop();S.tableau[ci].push({...c,up:true});addScore(5);S.moves++;renderTable();return;}
    }
    toast('Sin movimiento válido','info');
  }

  function clickCard(ci,ri){
    const col=S.tableau[ci];const c=col[ri];
    // Try foundation first (top card only)
    if(ri===col.length-1){
      for(let fi=0;fi<4;fi++){
        if(canFound(c,fi)){
          saveH();col.pop();S.found[fi].push(c);addScore(10);S.moves++;
          if(col.length&&!col[col.length-1].up){col[col.length-1].up=true;addScore(5);}
          renderTable();checkWin();return;
        }
      }
    }
    // Move stack to another column
    const stack=col.slice(ri);
    for(let tc=0;tc<7;tc++){
      if(tc===ci)continue;
      if(canTab(stack[0],tc)){
        saveH();
        S.tableau[ci]=col.slice(0,ri);
        S.tableau[tc].push(...stack.map(x=>({...x,up:true})));
        addScore(5);S.moves++;
        if(S.tableau[ci].length&&!S.tableau[ci][S.tableau[ci].length-1].up){
          S.tableau[ci][S.tableau[ci].length-1].up=true;addScore(5);
        }
        renderTable();return;
      }
    }
  }

  function autoFoundation(){
    let moved=false;
    for(let ci=0;ci<7;ci++){
      const col=S.tableau[ci];if(!col.length)continue;
      const c=col[col.length-1];
      for(let fi=0;fi<4;fi++){
        if(canFound(c,fi)){saveH();col.pop();S.found[fi].push(c);addScore(10);S.moves++;moved=true;break;}
      }
    }
    if(moved){renderTable();checkWin();}
  }

  function canFound(c,fi){
    const f=S.found[fi];
    if(!f.length)return c.rank==='A';
    return f[f.length-1].suit===c.suit&&f[f.length-1].val===c.val-1;
  }

  function canTab(c,ci){
    const col=S.tableau[ci];
    if(!col.length)return c.rank==='K';
    const top=col[col.length-1];if(!top.up)return false;
    return top.val===c.val+1&&top.color!==c.color;
  }

  function addScore(pts){S.score=Math.max(0,S.score+pts);}

  function saveH(){
    S.history.push(JSON.parse(JSON.stringify({stock:S.stock,waste:S.waste,found:S.found,tableau:S.tableau,score:S.score,moves:S.moves})));
    if(S.history.length>20)S.history.shift();
  }

  function undo(){
    if(!S.history.length){toast('Sin movimientos para deshacer','info');return;}
    const prev=S.history.pop();
    Object.assign(S,prev);renderTable();
  }

  function checkWin(){
    if(S.found.every(f=>f.length===13)){
      clearInterval(S.interval);
      confetti(60);
      recordResult('solitario','win',{score:S.score,time:S.timer,moves:S.moves});
      const table=con.querySelector('.sol-table');
      table.insertAdjacentHTML('afterbegin',`
        <div class="rbanner" style="border-color:#56d364;margin-bottom:8px">
          <span class="rbig">🂠</span>
          <span class="rtitle" style="color:#56d364">¡Completado!</span>
          <span class="rsub">${S.moves} movimientos · ${S.timer}s · ${S.score} puntos</span>
          <button class="btn-p" onclick="document.getElementById('sol-new').click()" style="margin-top:6px">🔄 Nueva partida</button>
        </div>`);
    }
  }

  render();
  return{id:'solitario',destroy(){clearInterval(S.interval);}};
}

function helpSolitario(){return`
<h4>Objetivo</h4>
<p>Mover todas las cartas a las 4 <strong>fundaciones</strong> (esquina derecha), ordenadas de As a Rey por palo.</p>
<h4>El tablero</h4>
<ul>
  <li><strong>Mazo (izq):</strong> cartas boca abajo. Toca para voltear 1 o 3.</li>
  <li><strong>Descarte (junto al mazo):</strong> carta(s) disponibles del mazo.</li>
  <li><strong>Fundaciones (der):</strong> 4 pilas A→K por palo (♠ ♥ ♦ ♣).</li>
  <li><strong>Tableau:</strong> 7 columnas de trabajo.</li>
</ul>
<h4>Reglas de movimiento</h4>
<ul>
  <li>En columnas: carta de <strong>color opuesto</strong> y valor inmediatamente superior (p.ej. 7♥ sobre 8♠).</li>
  <li>Puedes mover grupos de cartas visibles como una sola unidad.</li>
  <li>Solo un Rey (o grupo encabezado por Rey) puede ir a una columna vacía.</li>
  <li>En fundaciones: As primero, luego orden ascendente del mismo palo.</li>
</ul>
<h4>Puntuación</h4>
<table>
<tr><th>Acción</th><th>Puntos</th></tr>
<tr><td>Carta a fundación</td><td>+10</td></tr>
<tr><td>Carta descubierta en tableau</td><td>+5</td></tr>
<tr><td>Mover del descarte al tableau</td><td>+5</td></tr>
<tr><td>Reiniciar mazo</td><td>−100</td></tr>
</table>
<div class="tip">💡 Descubre cartas boca abajo lo antes posible. Empieza por las columnas más largas.</div>`;}
