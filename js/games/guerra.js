// ── GUERRA DE CARTAS (WAR) ───────────────────────────────────
function initGuerra(con){
  const S={player:[],house:[],phase:'ready',wins:0,losses:0,rounds:0};

  function highVal(c){
    if(c.rank==='A')return 14;if(c.rank==='K')return 13;
    if(c.rank==='Q')return 12;if(c.rank==='J')return 11;
    return c.val;
  }

  function render(){
    con.innerHTML='';const w=document.createElement('div');w.className='gwrap';
    if(S.phase==='ready'){
      w.innerHTML=`
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px;max-width:360px;margin:auto;width:100%">
        <div class="rbanner" style="width:100%">
          <span style="font-size:2.5rem">⚔️</span>
          <span class="rtitle">Guerra de Cartas</span>
          <span class="rsub">La carta más alta gana la ronda. ¡Acumula todas las cartas para ganar!</span>
        </div>
        <button class="btn-p" id="war-start" style="width:100%">⚔️ Comenzar batalla</button>
      </div>`;
      con.appendChild(w);
      document.getElementById('war-start').onclick=startGame;
      return;
    }
    w.innerHTML=`
      <div class="ibar">
        <div style="text-align:center"><span class="ival">${S.player.length}</span><span class="ilbl">Tus cartas</span></div>
        <div class="isep"></div>
        <div style="text-align:center"><span class="ival">${S.rounds}</span><span class="ilbl">Rondas</span></div>
        <div class="isep"></div>
        <div style="text-align:center"><span class="ival">${S.house.length}</span><span class="ilbl">Cartas Casa</span></div>
      </div>
      <div class="war-arena">
        <div class="war-pile">
          <div class="war-lbl">Casa</div>
          <div id="war-hcard" style="min-height:var(--ch);display:flex;align-items:center;justify-content:center"></div>
          <div class="war-cnt" id="war-hcnt">${S.house.length} cartas</div>
        </div>
        <div class="war-vs">VS</div>
        <div class="war-pile">
          <div class="war-lbl">Tú</div>
          <div id="war-pcard" style="min-height:var(--ch);display:flex;align-items:center;justify-content:center"></div>
          <div class="war-cnt" id="war-pcnt">${S.player.length} cartas</div>
        </div>
      </div>
      <div id="war-war" style="text-align:center;font-family:var(--fd);font-size:1.1rem;color:var(--bad);min-height:24px"></div>
      <div id="war-msg" style="text-align:center;font-family:var(--fd);font-size:1rem;min-height:26px"></div>
      <div class="brow">
        <button class="btn-p" id="war-flip">🃏 Revelar cartas</button>
        <button class="btn-s" id="war-new">🔄 Nueva partida</button>
      </div>`;
    con.appendChild(w);
    document.getElementById('war-flip').onclick=playRound;
    document.getElementById('war-new').onclick=()=>{S.phase='ready';render();};
  }

  function startGame(){
    const deck=shuffle(buildDeck());
    S.player=deck.slice(0,26);S.house=deck.slice(26);
    S.wins=0;S.losses=0;S.rounds=0;S.phase='play';
    render();
  }

  async function playRound(){
    if(!S.player.length||!S.house.length){endGame();return;}
    document.getElementById('war-flip').disabled=true;
    document.getElementById('war-msg').textContent='';
    document.getElementById('war-war').textContent='';

    const pc=S.player.shift(),hc=S.house.shift();
    S.rounds++;

    const pEl=mkCard(pc,{fd:true});
    const hEl=mkCard(hc,{fd:true});
    const pSlot=document.getElementById('war-pcard');
    const hSlot=document.getElementById('war-hcard');
    pSlot.innerHTML='';hSlot.innerHTML='';
    pSlot.appendChild(pEl);hSlot.appendChild(hEl);

    await flipUp(pEl,0);
    await flipUp(hEl,100);

    const pv=highVal(pc),hv=highVal(hc);

    if(pv>hv){
      S.player.push(pc,hc);S.wins++;
      document.getElementById('war-msg').innerHTML=`<span style="color:#56d364">¡Ganaste esta ronda! +2 cartas</span>`;
    } else if(hv>pv){
      S.house.push(pc,hc);S.losses++;
      document.getElementById('war-msg').innerHTML=`<span style="color:#f85149">La casa gana esta ronda</span>`;
    } else {
      await doWar([pc,hc]);
      return;
    }

    document.getElementById('war-hcnt').textContent=`${S.house.length} cartas`;
    document.getElementById('war-pcnt').textContent=`${S.player.length} cartas`;

    if(!S.player.length||!S.house.length){setTimeout(endGame,600);return;}
    document.getElementById('war-flip').disabled=false;
  }

  async function doWar(warPot){
    document.getElementById('war-war').textContent='⚔️ ¡GUERRA! ⚔️';

    // Need at least 4 cards each for war (3 face-down + 1 face-up)
    if(S.player.length<4||S.house.length<4){
      const winner=S.player.length>=S.house.length?'player':'house';
      if(winner==='player'){
        S.player.push(...warPot,...S.house.splice(0));
      } else {
        S.house.push(...warPot,...S.player.splice(0));
      }
      endGame();return;
    }

    // 3 face-down each
    for(let i=0;i<3;i++){warPot.push(S.player.shift(),S.house.shift());}

    // 1 face-up each
    const pw=S.player.shift(),hw=S.house.shift();
    warPot.push(pw,hw);

    await new Promise(r=>setTimeout(r,400));

    const pEl2=mkCard(pw,{fd:true}),hEl2=mkCard(hw,{fd:true});
    document.getElementById('war-pcard').innerHTML='';
    document.getElementById('war-hcard').innerHTML='';
    document.getElementById('war-pcard').appendChild(pEl2);
    document.getElementById('war-hcard').appendChild(hEl2);

    await flipUp(pEl2,0);await flipUp(hEl2,100);

    const pv=highVal(pw),hv=highVal(hw);
    document.getElementById('war-war').textContent='';

    if(pv>hv){
      S.player.push(...warPot);
      document.getElementById('war-msg').innerHTML=`<span style="color:#56d364">¡Ganaste la guerra! +${warPot.length} cartas</span>`;
    } else if(hv>pv){
      S.house.push(...warPot);
      document.getElementById('war-msg').innerHTML=`<span style="color:#f85149">La casa gana la guerra</span>`;
    } else {
      // Another tie — split the pot
      const half=Math.floor(warPot.length/2);
      S.player.push(...warPot.slice(0,half));
      S.house.push(...warPot.slice(half));
      document.getElementById('war-msg').innerHTML=`<span style="color:var(--warn)">¡Doble guerra! Cartas repartidas</span>`;
    }

    document.getElementById('war-hcnt').textContent=`${S.house.length} cartas`;
    document.getElementById('war-pcnt').textContent=`${S.player.length} cartas`;

    if(!S.player.length||!S.house.length){setTimeout(endGame,600);return;}
    document.getElementById('war-flip').disabled=false;
  }

  function endGame(){
    const won=S.player.length>S.house.length;
    recordResult('guerra',won?'win':'loss',{rounds:S.rounds,wins:S.wins,losses:S.losses});
    if(won)confetti(40);
    const w=con.querySelector('.gwrap');
    w.innerHTML=`
    <div style="display:flex;flex-direction:column;align-items:center;gap:16px;max-width:360px;margin:auto;width:100%">
      <div class="rbanner" style="width:100%">
        <span class="rbig">${won?'🏆':'😞'}</span>
        <span class="rtitle">${won?'¡Victoria!':'Derrota'}</span>
        <span class="rsub">${S.rounds} rondas · ${S.wins} victorias</span>
      </div>
      <div class="brow">
        <button class="btn-p" id="war-new2">⚔️ Nueva batalla</button>
      </div>
    </div>`;
    document.getElementById('war-new2').onclick=startGame;
  }

  render();return S;
}

function helpGuerra(){return`
<h4>Objetivo</h4>
<p>Quedarte con todas las 52 cartas. Tu oponente es la casa.</p>
<h4>Cómo jugar</h4>
<ul>
  <li>La baraja se divide en 2 montones de 26 cartas (tú y la casa).</li>
  <li>Cada ronda, ambos revelan su carta superior.</li>
  <li>La carta de <strong>mayor valor</strong> gana las 2 cartas.</li>
  <li>Ganas cuando la casa se queda sin cartas.</li>
</ul>
<h4>Jerarquía (mayor a menor)</h4>
<p style="font-family:var(--fh);color:var(--gold-l);font-size:.85rem">A &gt; K &gt; Q &gt; J &gt; 10 &gt; 9 &gt; 8 &gt; 7 &gt; 6 &gt; 5 &gt; 4 &gt; 3 &gt; 2</p>
<p>El <strong>As es siempre la carta más alta</strong>.</p>
<h4>¡GUERRA! ⚔️</h4>
<p>Si ambas cartas son iguales se declara guerra:</p>
<ul>
  <li>Cada jugador pone 3 cartas boca abajo.</li>
  <li>Luego revelan 1 carta boca arriba.</li>
  <li>La carta más alta se lleva todas las cartas del pozo.</li>
  <li>Si empatan de nuevo, el pozo se divide.</li>
</ul>
<div class="tip">💡 Si tienes muchos Ases tienes ventaja. El As gana a todas las demás cartas.</div>`;}
