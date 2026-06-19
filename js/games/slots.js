// ── TRAGAMONEDAS ─────────────────────────────────────────────
function initSlots(con){
  const SYMS=['🍋','🍊','🍇','🔔','⭐','💎','🎰','🃏'];
  const PAYS={
    '🍋🍋🍋':2,'🍊🍊🍊':3,'🍇🍇🍇':4,
    '🔔🔔🔔':6,'⭐⭐⭐':10,'💎💎💎':20,'🎰🎰🎰':50
  };
  const S={credits:100,spinning:false,wins:0,spins:0};

  function render(){
    con.innerHTML='';const w=document.createElement('div');w.className='gwrap';
    w.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
        <div class="credits"><span>💰</span><span class="cval" id="sl-cr">${S.credits}</span><span class="clbl">Créditos</span></div>
        <div class="credits"><span>📊</span><span class="cval" id="sl-ws">${S.wins}/${S.spins}</span><span class="clbl">Premios/Tiradas</span></div>
      </div>
      <div class="reels" id="sl-reels">
        ${[0,1,2].map(i=>`
          <div class="reel-win" id="sl-reel${i}">
            <div class="reel-strip" id="sl-strip${i}"></div>
            <div class="rshine"></div>
            <div class="payline"></div>
          </div>`).join('')}
      </div>
      <div id="sl-msg" style="font-family:var(--fd);font-size:1.05rem;text-align:center;min-height:26px;color:var(--gold-l)"></div>
      <div class="ptable">
        <div class="prow"><span class="phand">🃏 Joker (comodín)</span><span class="pmult">combinaciones</span></div>
        ${Object.entries(PAYS).map(([k,v])=>`
          <div class="prow"><span class="phand">${[...k].join(' ')}</span><span class="pmult">${v}×</span></div>`).join('')}
      </div>
      <button class="btn-p" id="sl-spin" style="margin-top:auto;flex-shrink:0">🎰 Tirar (−1 crédito)</button>`;
    con.appendChild(w);
    for(let i=0;i<3;i++)initStrip(i);
    document.getElementById('sl-spin').onclick=spin;
  }

  function initStrip(i){
    const strip=document.getElementById(`sl-strip${i}`);
    strip.innerHTML='';
    for(let j=0;j<20;j++){
      const div=document.createElement('div');div.className='rsym';
      div.textContent=SYMS[0|Math.random()*SYMS.length];
      strip.appendChild(div);
    }
    strip.style.transform='translateY(0)';
  }

  function spin(){
    if(S.spinning||S.credits<1){if(S.credits<1){toast('Sin créditos','err');showRecharge();}return;}
    S.credits--;S.spins++;S.spinning=true;
    document.getElementById('sl-spin').disabled=true;
    document.getElementById('sl-msg').textContent='';
    document.getElementById('sl-cr').textContent=S.credits;
    document.getElementById('sl-ws').textContent=`${S.wins}/${S.spins}`;

    const results=[];
    for(let i=0;i<3;i++){
      const sym=SYMS[0|Math.random()*SYMS.length];
      results.push(sym);
      animateReel(i,sym,i*200);
    }
    setTimeout(()=>{
      S.spinning=false;
      document.getElementById('sl-spin').disabled=false;
      evaluate(results);
      document.getElementById('sl-ws').textContent=`${S.wins}/${S.spins}`;
    },1800+3*200);
  }

  function animateReel(i,finalSym,delay){
    setTimeout(()=>{
      const strip=document.getElementById(`sl-strip${i}`);
      const cells=strip.children;
      cells[cells.length-1].textContent=finalSym;
      for(let j=0;j<cells.length-1;j++)cells[j].textContent=SYMS[0|Math.random()*SYMS.length];
      strip.style.transition='none';strip.style.transform='translateY(0)';
      setTimeout(()=>{
        strip.style.transition=`transform 1.4s cubic-bezier(.17,.67,.25,1.1)`;
        strip.style.transform=`translateY(-${(cells.length-1)*96}px)`;
      },20);
    },delay);
  }

  function evaluate(res){
    const key=res.join('');
    let win=0,msg='';
    if(res.every(s=>s==='🃏')){win=50;msg='🃏🃏🃏 ¡TRIPLE JOKER!';}
    else if(PAYS[key]){win=PAYS[key];msg=`${res[0]} ${res[1]} ${res[2]} ×${win}`;}
    else{
      // Joker wildcard substitution
      const nonJ=res.filter(s=>s!=='🃏');
      if(res.includes('🃏')&&nonJ.length>=1&&nonJ.every(s=>s===nonJ[0])){
        const testKey=nonJ[0].repeat(3);
        if(PAYS[testKey]){win=Math.ceil(PAYS[testKey]*.6);msg=`🃏 Comodín ayuda: ${nonJ[0]} × ×${win}`;}
      }
    }
    if(win>0){
      S.wins++;S.credits+=win;
      document.getElementById('sl-cr').textContent=S.credits;
      document.getElementById('sl-msg').innerHTML=`<span style="color:#56d364">${msg} +${win} créditos</span>`;
      recordResult('slots','win',{res,win});
      if(win>=20)confetti(win>=50?55:25);
    } else {
      document.getElementById('sl-msg').innerHTML=`<span style="color:var(--tx-m)">Sin premio esta vez</span>`;
      recordResult('slots','loss',{res});
    }
    if(S.credits<=0)showRecharge();
  }

  function showRecharge(){
    const btn=document.getElementById('sl-spin');if(!btn)return;
    btn.disabled=true;
    const b=document.createElement('button');b.className='btn-s';b.style.marginTop='6px';
    b.textContent='💰 Recargar 100 créditos';
    b.onclick=()=>{S.credits=100;S.spins=0;S.wins=0;render();};
    con.querySelector('.gwrap').appendChild(b);
  }

  render();return S;
}

function helpSlots(){return`
<h4>Cómo jugar</h4>
<ul>
  <li>Cada tirada cuesta 1 crédito. Comienzas con 100.</li>
  <li>Pulsa el botón para hacer girar los 3 rodillos.</li>
  <li>Si los 3 símbolos de la línea central son iguales ¡ganas!</li>
</ul>
<h4>Tabla de premios (3 iguales en la línea central)</h4>
<table>
<tr><th>Símbolo</th><th>Premio</th></tr>
<tr><td>🍋 Limón</td><td>2×</td></tr>
<tr><td>🍊 Naranja</td><td>3×</td></tr>
<tr><td>🍇 Uvas</td><td>4×</td></tr>
<tr><td>🔔 Campana</td><td>6×</td></tr>
<tr><td>⭐ Estrella</td><td>10×</td></tr>
<tr><td>💎 Diamante</td><td>20×</td></tr>
<tr><td>🎰 Seven</td><td>50×</td></tr>
<tr><td>🃏🃏🃏 Triple Joker</td><td>50×</td></tr>
</table>
<h4>El Joker 🃏</h4>
<p>El Joker es comodín: si aparece junto a dos símbolos iguales, los sustituye completando la combinación (con premio reducido al 60%).</p>
<div class="tip">💡 El Seven 🎰 es el símbolo más valioso. ¡Tres Sevens te dan 50 créditos!</div>`;}
