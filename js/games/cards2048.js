// ── 2048 CARTAS ──────────────────────────────────────────────
function initCards2048(con){
  const LEVELS=['A','2','3','4','5','6','7','8','9','10','J','Q','K','🃏'];
  const SUITS_C=['♠','♥','♦','♣'];
  const LCOLS=['lv1','lv2','lv3','lv4','lv5','lv6','lv7','lv8','lv9','lv10','lv11','lv12','lv13'];
  const S={board:Array(16).fill(null),score:0,best:0,over:false};
  let _keyFn=null;

  function spawn(){
    const empty=[];for(let i=0;i<16;i++)if(!S.board[i])empty.push(i);
    if(!empty.length)return;
    const idx=empty[0|Math.random()*empty.length];
    const lv=Math.random()<.8?0:1;
    S.board[idx]={rank:LEVELS[lv],suit:SUITS_C[0|Math.random()*4],lv};
  }

  function render(){
    con.innerHTML='';const w=document.createElement('div');w.className='gwrap';
    w.innerHTML=`
      <div class="ibar">
        <div style="text-align:center"><span class="ival" id="c2-score">${S.score}</span><span class="ilbl">Puntos</span></div>
        <div class="isep"></div>
        <div style="text-align:center"><span class="ival" id="c2-best">${S.best}</span><span class="ilbl">Mejor</span></div>
      </div>
      <div class="slbl">Combina cartas iguales → sube de jerarquía → alcanza 🃏</div>
      <div class="board2048" id="c2-board"></div>
      <div class="slbl" style="font-size:.58rem;opacity:.7">A → 2 → 3 → … → 10 → J → Q → K → 🃏</div>
      <div class="brow">
        <button class="btn-p" id="c2-new">🔄 Nuevo juego</button>
      </div>`;
    con.appendChild(w);
    renderBoard();
    document.getElementById('c2-new').onclick=newGame;

    // Touch swipe
    let tx=0,ty=0;
    const board=document.getElementById('c2-board');
    board.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
    board.addEventListener('touchend',e=>{
      const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
      if(Math.abs(dx)>Math.abs(dy))move(dx>0?'right':'left');
      else move(dy>0?'down':'up');
    });

    // Keyboard
    _keyFn=e=>{
      const m={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};
      if(m[e.key]){e.preventDefault();move(m[e.key]);}
    };
    document.addEventListener('keydown',_keyFn);
  }

  function renderBoard(){
    const b=document.getElementById('c2-board');if(!b)return;
    b.innerHTML='';
    S.board.forEach(t=>{
      const cell=document.createElement('div');
      if(t){
        cell.className=`cell2048 ${LCOLS[t.lv]||'lv1'} pop`;
        cell.innerHTML=`<span class="c2-suit">${t.suit}</span><span class="c2-rank">${t.rank}</span>`;
      } else {
        cell.className='cell2048';
      }
      b.appendChild(cell);
    });
  }

  function move(dir){
    if(S.over)return;
    const prev=JSON.stringify(S.board);
    if(dir==='left'||dir==='right'){
      for(let r=0;r<4;r++){
        let row=S.board.slice(r*4,r*4+4);
        row=slide(row,dir==='right');
        for(let c=0;c<4;c++)S.board[r*4+c]=row[c];
      }
    } else {
      for(let c=0;c<4;c++){
        let col=[S.board[c],S.board[c+4],S.board[c+8],S.board[c+12]];
        col=slide(col,dir==='down');
        [S.board[c],S.board[c+4],S.board[c+8],S.board[c+12]]=col;
      }
    }
    if(JSON.stringify(S.board)!==prev){
      spawn();
      if(S.score>S.best)S.best=S.score;
      renderBoard();
      const sc=document.getElementById('c2-score');if(sc)sc.textContent=S.score;
      const bs=document.getElementById('c2-best');if(bs)bs.textContent=S.best;
      checkOver();
    }
  }

  function slide(line,rev){
    if(rev)line=[...line].reverse();
    let arr=line.filter(Boolean);
    for(let i=0;i<arr.length-1;i++){
      if(arr[i]&&arr[i+1]&&arr[i].lv===arr[i+1].lv){
        const nl=arr[i].lv+1;
        if(nl>=13){
          // WIN!
          confetti();
          recordResult('cards2048','win',{score:S.score});
          S.over=true;
          setTimeout(showWin,300);
          return line;
        }
        S.score+=Math.pow(2,nl+1);
        arr[i]={rank:LEVELS[nl],suit:SUITS_C[0|Math.random()*4],lv:nl};
        arr.splice(i+1,1);
      }
    }
    while(arr.length<4)arr.push(null);
    return rev?arr.reverse():arr;
  }

  function checkOver(){
    if(S.board.some(t=>!t))return;
    for(let i=0;i<16;i++){
      if(i%4!==3&&S.board[i]&&S.board[i+1]&&S.board[i].lv===S.board[i+1].lv)return;
      if(i<12&&S.board[i]&&S.board[i+4]&&S.board[i].lv===S.board[i+4].lv)return;
    }
    S.over=true;
    recordResult('cards2048','loss',{score:S.score});
    const w=con.querySelector('.gwrap');
    w.insertAdjacentHTML('afterbegin',`
      <div class="rbanner" style="border-color:var(--bad);margin-bottom:8px">
        <span class="rbig">😵</span>
        <span class="rtitle">¡Sin movimientos!</span>
        <span class="rsub">Puntuación final: ${S.score}</span>
        <button class="btn-p" onclick="document.getElementById('c2-new').click()">🔄 Intentar de nuevo</button>
      </div>`);
  }

  function showWin(){
    const w=con.querySelector('.gwrap');
    w.insertAdjacentHTML('afterbegin',`
      <div class="rbanner" style="border-color:var(--ok);margin-bottom:8px">
        <span class="rbig">🃏</span>
        <span class="rtitle" style="color:#56d364">¡JOKER! ¡Ganaste!</span>
        <span class="rsub">Puntuación: ${S.score}</span>
        <button class="btn-p" onclick="document.getElementById('c2-new').click()">🔄 Jugar de nuevo</button>
      </div>`);
  }

  function newGame(){
    S.board=Array(16).fill(null);S.score=0;S.over=false;
    spawn();spawn();render();
  }

  spawn();spawn();render();
  return{id:'cards2048',destroy(){if(_keyFn)document.removeEventListener('keydown',_keyFn);}};
}

function helpCards2048(){return`
<h4>Objetivo</h4>
<p>Combina cartas iguales para ir subiendo en la jerarquía hasta alcanzar el 🃏 Joker.</p>
<h4>Jerarquía de cartas</h4>
<p style="font-family:var(--fh);letter-spacing:.04em;color:var(--gold-l);font-size:.85rem">
  A → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → J → Q → K → 🃏
</p>
<h4>Cómo jugar</h4>
<ul>
  <li>Desliza (swipe) en cualquier dirección: arriba, abajo, izquierda o derecha.</li>
  <li>Todas las cartas se mueven en esa dirección.</li>
  <li>Dos cartas del mismo nivel que colisionan → se combinan y suben un nivel.</li>
  <li>Tras cada movimiento aparece una carta nueva (A o 2) en posición aleatoria.</li>
</ul>
<h4>Fin del juego</h4>
<ul>
  <li><strong>Victoria:</strong> consigues el Joker 🃏.</li>
  <li><strong>Derrota:</strong> el tablero se llena y no hay movimientos posibles.</li>
</ul>
<div class="tip">💡 Mantén las cartas de mayor nivel en una esquina y construye desde ahí hacia el resto.</div>`;}
