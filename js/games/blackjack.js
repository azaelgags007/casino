// ── BLACKJACK ────────────────────────────────────────────────
function initBlackjack(con){
  const S={deck:[],player:[],house:[],phase:'idle',wins:0,losses:0,draws:0,streak:0};

  function newDeck(){S.deck=shuffle(buildDeck());}
  function draw(){if(S.deck.length<6)newDeck();return S.deck.pop();}

  function bjVal(hand){
    let s=0,aces=0;
    for(const c of hand){if(c.rank==='A'){aces++;s+=11;}else s+=Math.min(c.val,10);}
    while(s>21&&aces>0){s-=10;aces--;}
    return s;
  }
  function isNatural(hand){return hand.length===2&&bjVal(hand)===21;}

  function render(){
    con.innerHTML='';const w=document.createElement('div');w.className='gwrap';
    w.innerHTML=`
      <div class="ibar">
        <div style="text-align:center"><span class="ival" id="bj-w">${S.wins}</span><span class="ilbl">Victorias</span></div>
        <div class="isep"></div>
        <div style="text-align:center"><span class="ival" id="bj-l">${S.losses}</span><span class="ilbl">Derrotas</span></div>
        <div class="isep"></div>
        <div style="text-align:center"><span class="ival" id="bj-d">${S.draws}</span><span class="ilbl">Empates</span></div>
        <div class="isep"></div>
        <div style="text-align:center"><span class="ival" id="bj-st">${S.streak}🔥</span><span class="ilbl">Racha</span></div>
      </div>
      <div class="bj-zone">
        <div class="slbl">Casa</div>
        <div class="bj-hand" id="bj-hh"></div>
        <div class="bj-score" id="bj-hs">?</div>
      </div>
      <div style="flex:1"></div>
      <div class="bj-zone">
        <div class="slbl">Tú</div>
        <div class="bj-hand" id="bj-ph"></div>
        <div class="bj-score" id="bj-ps">0</div>
      </div>
      <div id="bj-msg" style="font-family:var(--fd);font-size:1rem;text-align:center;min-height:26px"></div>
      <div class="brow" id="bj-btns">
        <button class="btn-p" id="bj-deal">🃏 Repartir</button>
      </div>`;
    con.appendChild(w);
    document.getElementById('bj-deal').onclick=startRound;
  }

  function startRound(){
    newDeck();S.player=[];S.house=[];S.phase='play';
    const ph=document.getElementById('bj-ph'),hh=document.getElementById('bj-hh');
    ph.innerHTML='';hh.innerHTML='';
    document.getElementById('bj-msg').textContent='';
    document.getElementById('bj-btns').innerHTML='';

    // Deal 2 each
    [S.player,S.house,S.player,S.house].forEach(hand=>hand.push(draw()));

    // Player cards face up
    S.player.forEach((c,i)=>{
      const el=mkCard(c);el.style.opacity='0';ph.appendChild(el);
      setTimeout(()=>{el.classList.add('dealing');el.style.opacity='';},i*150);
    });
    // House: first face up, second face down
    const h0=mkCard(S.house[0]);h0.style.opacity='0';
    const h1=mkCard(S.house[1],{fd:true});h1.style.opacity='0';
    hh.appendChild(h0);hh.appendChild(h1);
    setTimeout(()=>{h0.classList.add('dealing');h0.style.opacity='';},300);
    setTimeout(()=>{h1.classList.add('dealing');h1.style.opacity='';},450);

    setTimeout(()=>{
      updatePS();
      if(isNatural(S.player)){endRound();return;}
      document.getElementById('bj-btns').innerHTML=`
        <button class="btn-p" id="bj-hit">👆 Pedir</button>
        <button class="btn-s" id="bj-stand">✋ Plantarse</button>`;
      document.getElementById('bj-hit').onclick=hit;
      document.getElementById('bj-stand').onclick=stand;
    },700);
  }

  function updatePS(){
    const ps=bjVal(S.player);
    document.getElementById('bj-ps').textContent=ps+(ps>21?' 💥':'');
  }

  function hit(){
    const c=draw();S.player.push(c);
    const ph=document.getElementById('bj-ph');
    const el=mkCard(c);el.style.opacity='0';ph.appendChild(el);
    setTimeout(()=>{el.classList.add('dealing');el.style.opacity='';},0);
    updatePS();
    if(bjVal(S.player)>21) endRound();
  }

  function stand(){endRound();}

  async function endRound(){
    S.phase='result';
    document.getElementById('bj-btns').innerHTML='';
    // Reveal hidden house card
    const hh=document.getElementById('bj-hh');
    const h1el=hh.children[1];
    if(h1el){
      h1el.innerHTML=`<div class="cb"></div><div class="cf">${cardFaceHTML(S.house[1])}</div>`;
      h1el.className=`card ${S.house[1].color}`;
      await flipUp(h1el,0);
    }
    // House draws to 17+
    while(bjVal(S.house)<17){
      const c=draw();S.house.push(c);
      const el=mkCard(c);el.style.opacity='0';hh.appendChild(el);
      await new Promise(r=>setTimeout(()=>{el.classList.add('dealing');el.style.opacity='';r();},300));
      await new Promise(r=>setTimeout(r,420));
    }
    const ps=bjVal(S.player),hs=bjVal(S.house);
    document.getElementById('bj-hs').textContent=hs+(hs>21?' 💥':'');

    let result,msg,col;
    if(isNatural(S.player)&&isNatural(S.house)){result='draw';msg='🤝 Doble Blackjack — Empate';col='var(--warn)';}
    else if(isNatural(S.player)){result='win';msg='🎰 ¡BLACKJACK!';col='#56d364';}
    else if(ps>21){result='loss';msg='💥 ¡Te pasaste!';col='#f85149';}
    else if(hs>21){result='win';msg='🎉 ¡La casa se pasó!';col='#56d364';}
    else if(ps>hs){result='win';msg='🏆 ¡Ganaste!';col='#56d364';}
    else if(ps<hs){result='loss';msg='😞 La casa gana';col='#f85149';}
    else{result='draw';msg='🤝 Empate';col='var(--warn)';}

    if(result==='win'){S.wins++;S.streak++;}
    else if(result==='loss'){S.losses++;S.streak=0;}
    else S.draws++;

    recordResult('blackjack',result,{ps,hs});
    if(result==='win') confetti(30);

    document.getElementById('bj-w').textContent=S.wins;
    document.getElementById('bj-l').textContent=S.losses;
    document.getElementById('bj-d').textContent=S.draws;
    document.getElementById('bj-st').textContent=`${S.streak}🔥`;
    document.getElementById('bj-msg').innerHTML=`<span style="color:${col};font-family:var(--fd)">${msg}</span>`;
    document.getElementById('bj-btns').innerHTML=`<button class="btn-p" id="bj-deal">🃏 Nueva mano</button>`;
    document.getElementById('bj-deal').onclick=startRound;
  }

  render();return S;
}

function helpBlackjack(){return`
<h4>Objetivo</h4>
<p>Acercarte a 21 sin pasarte, y tener más puntos que la casa.</p>
<h4>Valor de las cartas</h4>
<table>
<tr><th>Carta</th><th>Valor</th></tr>
<tr><td>2 – 10</td><td>Valor nominal</td></tr>
<tr><td>J, Q, K</td><td>10 puntos</td></tr>
<tr><td>As (A)</td><td>1 u 11 (el mejor para ti)</td></tr>
</table>
<h4>Cómo jugar</h4>
<ul>
  <li>Ambos reciben 2 cartas. Una carta de la casa queda oculta.</li>
  <li><strong>Pedir:</strong> recibes una carta adicional.</li>
  <li><strong>Plantarse:</strong> te quedas con tus cartas; la casa revela la suya.</li>
  <li>La casa siempre pide cartas hasta alcanzar 17 o más.</li>
</ul>
<h4>Resultados</h4>
<table>
<tr><th>Situación</th><th>Resultado</th></tr>
<tr><td>Blackjack natural (A + figura con 2 cartas)</td><td>Victoria 🎰</td></tr>
<tr><td>Más cerca de 21 que la casa</td><td>Victoria</td></tr>
<tr><td>Igual que la casa</td><td>Empate</td></tr>
<tr><td>Más de 21 puntos (bust)</td><td>Derrota</td></tr>
</table>
<div class="tip">💡 Regla básica: pide siempre con 11 o menos. Plántate con 17 o más.</div>`;}
