// ── BINGO 75 ─────────────────────────────────────────────────
function initBingo(con){
  const COLS={B:[1,15],I:[16,30],N:[31,45],G:[46,60],O:[61,75]};
  const COL_KEYS=Object.keys(COLS);
  const S={cards:[],called:[],bag:[],interval:null,phase:'setup',numCards:1,autoPlay:false};

  function makeCard(){
    return COL_KEYS.map(c=>{
      const [min,max]=COLS[c];
      const pool=[];for(let i=min;i<=max;i++)pool.push(i);
      return shuffle(pool).slice(0,5);
    });
  }

  function render(){
    con.innerHTML='';const w=document.createElement('div');w.className='gwrap';
    if(S.phase==='setup'){
      w.innerHTML=`
      <div style="max-width:360px;margin:0 auto;width:100%;display:flex;flex-direction:column;gap:14px">
        <div class="slbl">¿Cuántos cartones quieres jugar?</div>
        <div style="display:flex;gap:10px;justify-content:center">
          ${[1,2,4].map(n=>`<button class="btn-s bncnt ${S.numCards===n?'active':''}" data-n="${n}" style="flex:1">${n} cartón${n>1?'es':''}</button>`).join('')}
        </div>
        <button class="btn-p" id="bn-go">🔵 Comenzar Bingo</button>
      </div>`;
      con.appendChild(w);
      document.querySelectorAll('.bncnt').forEach(b=>{
        b.onclick=()=>{
          document.querySelectorAll('.bncnt').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');S.numCards=+b.dataset.n;
        };
      });
      document.getElementById('bn-go').onclick=startGame;
      return;
    }
    gameRender(w);
    con.appendChild(w);
  }

  function startGame(){
    S.cards=Array.from({length:S.numCards},makeCard);
    // center FREE
    S.cards.forEach(card=>{card[2][2]=0;});
    S.called=[];
    S.bag=shuffle(Array.from({length:75},(_,i)=>i+1));
    S.autoPlay=false;S.phase='play';
    render();
  }

  function gameRender(w){
    w.innerHTML=`
      <div class="ibar">
        <div style="text-align:center"><span class="ival" id="bn-cnt">${S.called.length}</span><span class="ilbl">Bolillas</span></div>
        <div class="isep"></div>
        <div style="text-align:center"><span class="ival" id="bn-last">—</span><span class="ilbl">Última</span></div>
        <div class="isep"></div>
        <div style="text-align:center"><span class="ival">${S.bag.length}</span><span class="ilbl" id="bn-rem">Restantes</span></div>
      </div>
      <div class="bingo-balls" id="bn-balls"></div>
      <div id="bn-cards" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;overflow-y:auto;flex:1"></div>
      <div class="brow" style="flex-shrink:0">
        <button class="btn-p" id="bn-draw">🔵 Sacar bolilla</button>
        <button class="btn-s" id="bn-auto">${S.autoPlay?'⏹ Parar':'▶ Auto'}</button>
        <button class="btn-s" id="bn-new">🔄 Nuevo</button>
      </div>`;
    renderCards();
    document.getElementById('bn-draw').onclick=drawBall;
    document.getElementById('bn-auto').onclick=toggleAuto;
    document.getElementById('bn-new').onclick=()=>{clearInterval(S.interval);S.phase='setup';render();};
  }

  function renderCards(){
    const el=document.getElementById('bn-cards');if(!el)return;
    el.innerHTML='';
    S.cards.forEach(card=>{
      const cardEl=document.createElement('div');cardEl.className='bingo-card';
      COL_KEYS.forEach(c=>{
        const h=document.createElement('div');h.className='bch';h.textContent=c;cardEl.appendChild(h);
      });
      for(let r=0;r<5;r++){
        for(let c=0;c<5;c++){
          const num=card[c][r];
          const cell=document.createElement('div');
          if(num===0){cell.className='bcell free';cell.textContent='FREE';}
          else{cell.className='bcell'+(S.called.includes(num)?' marked':'');cell.textContent=num;}
          cardEl.appendChild(cell);
        }
      }
      el.appendChild(cardEl);
    });
  }

  function getColLetter(num){
    if(num<=15)return 'B';if(num<=30)return 'I';if(num<=45)return 'N';
    if(num<=60)return 'G';return 'O';
  }

  function drawBall(){
    if(!S.bag.length){toast('¡Todas las bolillas han salido!','info');return;}
    const num=S.bag.shift();S.called.push(num);
    const c=getColLetter(num);
    document.getElementById('bn-cnt').textContent=S.called.length;
    document.getElementById('bn-last').textContent=`${c}${num}`;
    const rem=document.getElementById('bn-rem');if(rem)rem.textContent=`${S.bag.length} restantes`;

    const balls=document.getElementById('bn-balls');
    const ball=document.createElement('div');ball.className=`bball ${c}`;ball.textContent=num;
    balls.appendChild(ball);balls.scrollTop=balls.scrollHeight;

    renderCards();
    checkWin();
  }

  function toggleAuto(){
    S.autoPlay=!S.autoPlay;
    const btn=document.getElementById('bn-auto');
    if(btn)btn.textContent=S.autoPlay?'⏹ Parar':'▶ Auto';
    if(S.autoPlay){
      S.interval=setInterval(()=>{
        if(S.bag.length)drawBall();
        else{clearInterval(S.interval);S.autoPlay=false;}
      },1200);
    } else clearInterval(S.interval);
  }

  function checkWin(){
    for(let ci=0;ci<S.cards.length;ci++){
      const card=S.cards[ci];
      // Rows
      for(let r=0;r<5;r++){
        const row=[card[0][r],card[1][r],card[2][r],card[3][r],card[4][r]];
        if(row.every(n=>n===0||S.called.includes(n))){celebrate(ci,'línea horizontal');return;}
      }
      // Columns
      for(let c=0;c<5;c++){
        if(card[c].every(n=>n===0||S.called.includes(n))){celebrate(ci,'columna');return;}
      }
      // Diagonals
      if([card[0][0],card[1][1],card[2][2],card[3][3],card[4][4]].every(n=>n===0||S.called.includes(n))){celebrate(ci,'diagonal');return;}
      if([card[0][4],card[1][3],card[2][2],card[3][1],card[4][0]].every(n=>n===0||S.called.includes(n))){celebrate(ci,'diagonal');return;}
      // Full card
      if(card.every(col=>col.every(n=>n===0||S.called.includes(n)))){celebrate(ci,'cartón completo');return;}
    }
  }

  function celebrate(cardIdx,type){
    clearInterval(S.interval);S.autoPlay=false;
    confetti(45);
    recordResult('bingo','win',{type,balls:S.called.length,cards:S.numCards});
    const w=con.querySelector('.gwrap');
    w.innerHTML=`
    <div style="display:flex;flex-direction:column;align-items:center;gap:16px;max-width:360px;margin:auto;width:100%">
      <div class="rbanner" style="border-color:#56d364;width:100%">
        <span class="rbig">🔵</span>
        <span class="rtitle" style="color:#56d364">¡BINGO!</span>
        <span class="rsub">${type.charAt(0).toUpperCase()+type.slice(1)} en cartón ${cardIdx+1}</span>
        <span class="rsub">${S.called.length} bolillas sacadas</span>
      </div>
      <button class="btn-p" id="bn-new2" style="width:100%">🔵 Nueva partida</button>
    </div>`;
    document.getElementById('bn-new2').onclick=()=>{S.phase='setup';render();};
  }

  render();
  return{id:'bingo',destroy(){clearInterval(S.interval);}};
}

function helpBingo(){return`
<h4>Bingo 75 — Estándar americano</h4>
<p>El objetivo es completar una línea, columna, diagonal o el cartón completo.</p>
<h4>El cartón</h4>
<ul>
  <li>Cuadrícula de 5×5. La casilla central (N) es <strong>FREE</strong> — ya está marcada.</li>
  <li>Las columnas se llaman B-I-N-G-O, cada una con números de un rango:</li>
</ul>
<table>
<tr><th>Columna</th><th>Números</th></tr>
<tr><td>B</td><td>1 – 15</td></tr>
<tr><td>I</td><td>16 – 30</td></tr>
<tr><td>N</td><td>31 – 45</td></tr>
<tr><td>G</td><td>46 – 60</td></tr>
<tr><td>O</td><td>61 – 75</td></tr>
</table>
<h4>Formas de ganar</h4>
<table>
<tr><th>Tipo</th><th>Descripción</th></tr>
<tr><td>Línea</td><td>5 en fila horizontal</td></tr>
<tr><td>Columna</td><td>5 en fila vertical</td></tr>
<tr><td>Diagonal</td><td>5 en diagonal</td></tr>
<tr><td>Cartón lleno</td><td>Todas las 25 casillas marcadas</td></tr>
</table>
<h4>Opciones</h4>
<ul>
  <li><strong>Manual:</strong> saca una bolilla a la vez.</li>
  <li><strong>Auto:</strong> bolillas automáticas cada 1.2 segundos.</li>
  <li>Puedes jugar con 1, 2 o 4 cartones simultáneos.</li>
</ul>
<div class="tip">💡 Con más cartones tienes más probabilidades de ganar, ¡pero es más difícil seguirlos todos!</div>`;}
