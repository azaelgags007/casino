// ── ADIVINA LAS CARTAS ──────────────────────────────────────
function initAdivina(con){
  const S={n:10,phase:'setup',house:[],cards:[],sel:[]};

  function render(){
    con.innerHTML='';
    const w=document.createElement('div');w.className='gwrap';
    w.innerHTML=S.phase==='setup'?setupHTML():gameHTML();
    con.appendChild(w);
    bind();
  }

  function setupHTML(){return`
    <div style="max-width:380px;margin:0 auto;width:100%;display:flex;flex-direction:column;gap:14px">
      <div class="slbl">Número de cartas en juego</div>
      <div style="background:rgba(0,0,0,.3);border:1px solid var(--brd);border-radius:14px;padding:18px;display:flex;flex-direction:column;align-items:center;gap:12px">
        <input type="range" id="adv-sl" min="4" max="52" value="${S.n}" style="width:100%;accent-color:var(--gold);cursor:pointer">
        <div style="display:flex;align-items:baseline;gap:6px">
          <span id="adv-nd" style="font-family:var(--fd);font-size:2.2rem;color:var(--gold-l)">${S.n}</span>
          <span style="color:var(--tx-m);font-size:.85rem">cartas</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:7px;justify-content:center">
          ${[[6,'Fácil','#56d364'],[13,'Medio','var(--warn)'],[26,'Difícil','#f85149'],[52,'Locura','#a371f7']]
            .map(([v,l,c])=>`<span data-v="${v}" class="dtag" style="padding:4px 11px;border-radius:18px;border:1px solid ${c};color:${c};font-family:var(--fh);font-size:.68rem;letter-spacing:.05em;cursor:pointer">${l} (${v})</span>`)
            .join('')}
        </div>
      </div>
      <button class="btn-p" id="adv-go">🃏 Repartir Cartas</button>
    </div>`;}

  function gameHTML(){return`
    <div style="display:flex;flex-direction:column;gap:11px;flex:1;overflow:hidden">
      <div class="ibar">
        <div style="text-align:center"><span class="ival">${S.n}</span><span class="ilbl">Cartas</span></div>
        <div class="isep"></div>
        <div style="text-align:center"><span class="ival" id="adv-sc">0/2</span><span class="ilbl">Elegidas</span></div>
        <div class="isep"></div>
        <div style="text-align:center"><span class="ival">${Math.round(2/S.n*100)}%</span><span class="ilbl">Prob/carta</span></div>
      </div>
      <div class="slbl">🏠 Cartas de la Casa (ocultas)</div>
      <div style="display:flex;gap:18px;justify-content:center" id="adv-house"></div>
      <div class="slbl">Tus cartas — elige exactamente 2</div>
      <div id="adv-grid" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;overflow-y:auto;flex:1;padding-bottom:6px"></div>
      <button class="btn-p" id="adv-ok" disabled style="flex-shrink:0">Confirmar selección</button>
    </div>`;}

  function bind(){
    if(S.phase==='setup'){
      const sl=document.getElementById('adv-sl'),nd=document.getElementById('adv-nd');
      if(sl){
        sl.oninput=()=>{S.n=+sl.value;nd.textContent=S.n;};
        document.querySelectorAll('.dtag').forEach(t=>t.onclick=()=>{sl.value=t.dataset.v;S.n=+t.dataset.v;nd.textContent=S.n;});
      }
      document.getElementById('adv-go')?.addEventListener('click',deal);
    } else {
      document.getElementById('adv-ok')?.addEventListener('click',confirm);
    }
  }

  function deal(){
    const deck=shuffle(buildDeck());
    const picked=deck.slice(0,S.n);
    S.house=picked.slice(0,2);
    S.cards=shuffle(picked);
    S.sel=[];S.phase='game';render();

    const hEl=document.getElementById('adv-house');
    for(let i=0;i<2;i++){
      const el=mkCard(S.house[i],{fd:true});
      el.id=`adv-h${i}`;hEl.appendChild(el);
    }
    const grid=document.getElementById('adv-grid');
    S.cards.forEach((c,i)=>{
      const el=mkCard(c,{cp:true});el.style.opacity='0';grid.appendChild(el);
      setTimeout(()=>{el.classList.add('dealing');el.style.opacity='';el.addEventListener('click',()=>pick(c,el));},i*55+80);
    });
  }

  function pick(c,el){
    if(S.sel.length>=2&&!S.sel.includes(c.id)){
      el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');
      toast('Ya tienes 2 seleccionadas','info');return;
    }
    if(S.sel.includes(c.id)){
      S.sel=S.sel.filter(x=>x!==c.id);
      el.classList.remove('sel');
    } else {
      S.sel.push(c.id);el.classList.add('sel');
    }
    document.getElementById('adv-sc').textContent=`${S.sel.length}/2`;
    document.getElementById('adv-ok').disabled=S.sel.length!==2;
  }

  async function confirm(){
    const hIds=S.house.map(c=>c.id);
    const hits=S.sel.filter(id=>hIds.includes(id)).length;
    for(let i=0;i<2;i++){
      const el=document.getElementById(`adv-h${i}`);
      if(!el)continue;
      el.innerHTML=`<div class="cb"></div><div class="cf">${cardFaceHTML(S.house[i])}</div>`;
      el.className=`card ${S.house[i].color}`;
      await flipUp(el,i*320);
    }
    recordResult('adivina',hits===2?'win':hits===1?'draw':'loss',{hits,n:S.n});
    setTimeout(()=>showResult(hits),350);
  }

  function showResult(hits){
    const cfgs={
      2:{e:'🎯',t:'¡Perfecto!',m:'¡Encontraste las 2 cartas de la casa!',col:'#56d364'},
      1:{e:'⚡',t:'¡Casi!',m:'Acertaste 1 de las 2 cartas',col:'var(--warn)'},
      0:{e:'💀',t:'¡Fallaste!',m:'No acertaste ninguna carta',col:'#f85149'},
    };
    const cf=cfgs[hits];if(hits===2)confetti();
    const w=con.querySelector('.gwrap');
    w.innerHTML=`
    <div style="display:flex;flex-direction:column;align-items:center;gap:18px;max-width:380px;margin:0 auto;width:100%;padding-top:8px">
      <div class="rbanner" style="width:100%">
        <span class="rbig">${cf.e}</span>
        <span style="font-family:var(--fd);font-size:2rem;color:${cf.col}">${hits}/2</span>
        <span class="rtitle">${cf.t}</span>
        <span class="rsub">${cf.m}</span>
      </div>
      <div class="slbl">Las cartas de la casa eran:</div>
      <div id="adv-rev" style="display:flex;gap:20px;justify-content:center"></div>
      <div class="brow" style="margin-top:6px">
        <button class="btn-p" id="adv-again">🔄 Jugar de nuevo</button>
        <button class="btn-s" id="adv-cfg">⚙️ Cambiar N</button>
      </div>
    </div>`;
    const rev=document.getElementById('adv-rev');
    S.house.forEach((c,i)=>{
      const wrap=document.createElement('div');
      wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:5px';
      const el=mkCard(c);
      el.style.animation=`bounceIn .5s var(--spring) ${i*140}ms both`;
      const lbl=document.createElement('span');
      lbl.style.cssText=`font-family:var(--fh);font-size:.62rem;letter-spacing:.06em;color:${S.sel.includes(c.id)?'#56d364':'#f85149'}`;
      lbl.textContent=S.sel.includes(c.id)?'✓ Acertada':'✗ Fallada';
      wrap.append(el,lbl);rev.appendChild(wrap);
    });
    document.getElementById('adv-again').onclick=deal;
    document.getElementById('adv-cfg').onclick=()=>{S.phase='setup';render();};
  }

  render();return S;
}

function helpAdivina(){return`
<h4>Objetivo</h4>
<p>La casa tiene 2 cartas ocultas. Tú ves N cartas en pantalla y debes identificar cuáles 2 son las de la casa.</p>
<h4>Cómo jugar</h4>
<ul>
  <li>Elige cuántas cartas se reparten (mínimo 4, máximo 52).</li>
  <li>Las 2 cartas de la casa <strong>siempre están incluidas</strong> entre las N que ves.</li>
  <li>Toca exactamente 2 cartas. Toca de nuevo para deseleccionar.</li>
  <li>Pulsa <em>Confirmar selección</em> para revelar el resultado.</li>
</ul>
<h4>Puntuación</h4>
<table>
<tr><th>Resultado</th><th>Registro</th></tr>
<tr><td>🎯 2/2 correctas</td><td>Victoria</td></tr>
<tr><td>⚡ 1/2 correctas</td><td>Empate</td></tr>
<tr><td>💀 0/2 correctas</td><td>Derrota</td></tr>
</table>
<h4>Probabilidad</h4>
<p>Con N cartas, la probabilidad de acertar ambas al azar es <strong>1 en C(N,2)</strong>. Con 10 cartas: ≈2.2%. Con 4 cartas: ≈16.7%.</p>
<div class="tip">💡 Usa N pequeño para aprender. Con N=52 es pura suerte de 1 en 1326.</div>`;}
