// ── RULETA EUROPEA ───────────────────────────────────────────
function initRuleta(con){
  const RED=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  const ORDER=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
  const S={credits:500,bet:0,betType:'',betNum:-1,spinning:false,last:[]};
  let canvas,ctx,angle=0,raf=null;

  function render(){
    con.innerHTML='';const w=document.createElement('div');w.className='gwrap';
    w.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
        <div class="credits"><span>💰</span><span class="cval" id="rl-cr">${S.credits}</span><span class="clbl">Créditos</span></div>
        <div class="credits"><span>🎯</span><span class="cval" id="rl-bet">${S.bet}</span><span class="clbl">Apuesta</span></div>
      </div>
      <div class="roul-wrap">
        <canvas id="rl-canvas" width="210" height="210"></canvas>
        <div id="rl-result" style="font-family:var(--fd);font-size:1rem;text-align:center;min-height:22px;margin-top:4px"></div>
      </div>
      <div class="slbl">Tipo de apuesta</div>
      <div class="roul-bets" id="rl-bets">
        ${[
          {t:'red',  l:'🔴 Rojo',  p:'1:1', rc:'red-bet'},
          {t:'black',l:'⚫ Negro', p:'1:1', rc:''},
          {t:'even', l:'Par',      p:'1:1', rc:''},
          {t:'odd',  l:'Impar',    p:'1:1', rc:''},
          {t:'low',  l:'1–18',     p:'1:1', rc:''},
          {t:'high', l:'19–36',    p:'1:1', rc:''},
          {t:'doz1', l:'1ª Doc.',  p:'2:1', rc:''},
          {t:'doz2', l:'2ª Doc.',  p:'2:1', rc:''},
          {t:'doz3', l:'3ª Doc.',  p:'2:1', rc:''},
        ].map(b=>`<button class="rbet ${b.rc}" data-t="${b.t}">
          <span>${b.l}</span><span class="rbet-pay">${b.p}</span>
        </button>`).join('')}
      </div>
      <div class="slbl">Número exacto (35:1) — toca para seleccionar</div>
      <div class="rnum-grid" id="rl-nums"></div>
      <div class="slbl" style="text-align:left">Cantidad a apostar</div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        ${[5,10,25,50,100].map(v=>`<button class="btn-s" style="flex:1;padding:6px 4px;font-size:.7rem" data-chip="${v}">${v}</button>`).join('')}
      </div>
      <div class="brow">
        <button class="btn-p" id="rl-spin" disabled>🎡 Girar</button>
        <button class="btn-s" id="rl-clear">✕ Limpiar</button>
      </div>
      <div id="rl-hist" style="font-size:.68rem;color:var(--tx-m);text-align:center">Últimos: —</div>`;
    con.appendChild(w);

    canvas=document.getElementById('rl-canvas');ctx=canvas.getContext('2d');
    drawWheel(0);

    // Chips
    document.querySelectorAll('[data-chip]').forEach(b=>b.onclick=()=>{
      if(!S.betType){toast('Selecciona un tipo de apuesta primero','info');return;}
      S.bet+=+b.dataset.chip;
      document.getElementById('rl-bet').textContent=S.bet;
      document.getElementById('rl-spin').disabled=false;
    });

    // Bet type buttons
    document.querySelectorAll('.rbet').forEach(b=>b.onclick=()=>{
      document.querySelectorAll('.rbet').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.rnbtn').forEach(x=>x.classList.remove('sel'));
      b.classList.add('active');
      S.betType=b.dataset.t;S.betNum=-1;
      S.bet=0;document.getElementById('rl-bet').textContent=0;
      document.getElementById('rl-spin').disabled=true;
    });

    // Number grid
    const ng=document.getElementById('rl-nums');
    for(let i=0;i<=36;i++){
      const btn=document.createElement('button');
      btn.className=`rnbtn ${i===0?'rgrn':RED.includes(i)?'rred':'rblk'}`;
      btn.textContent=i;
      btn.onclick=()=>{
        document.querySelectorAll('.rnbtn').forEach(x=>x.classList.remove('sel'));
        document.querySelectorAll('.rbet').forEach(x=>x.classList.remove('active'));
        btn.classList.add('sel');
        S.betType='num';S.betNum=i;
        S.bet=0;document.getElementById('rl-bet').textContent=0;
        document.getElementById('rl-spin').disabled=true;
      };
      ng.appendChild(btn);
    }

    document.getElementById('rl-spin').onclick=spin;
    document.getElementById('rl-clear').onclick=()=>{
      S.bet=0;S.betType='';S.betNum=-1;
      document.getElementById('rl-bet').textContent=0;
      document.getElementById('rl-spin').disabled=true;
      document.querySelectorAll('.rbet,.rnbtn').forEach(x=>x.classList.remove('active','sel'));
    };
  }

  function drawWheel(rot){
    const cx=105,cy=105,r=102;
    ctx.clearRect(0,0,210,210);
    ORDER.forEach((num,i)=>{
      const a0=rot+i*(2*Math.PI/37)-Math.PI/2;
      const a1=a0+2*Math.PI/37;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,a0,a1);ctx.closePath();
      ctx.fillStyle=num===0?'#1a7a2e':RED.includes(num)?'#c01818':'#1a1a1a';
      ctx.fill();ctx.strokeStyle='#d4af37';ctx.lineWidth=.7;ctx.stroke();
      const ma=a0+(a1-a0)/2;
      ctx.save();ctx.translate(cx+Math.cos(ma)*(r-11),cy+Math.sin(ma)*(r-11));
      ctx.rotate(ma+Math.PI/2);
      ctx.fillStyle='#fff';ctx.font='bold 7px Inter';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(num,0,0);ctx.restore();
    });
    // Center
    ctx.beginPath();ctx.arc(cx,cy,17,0,2*Math.PI);
    ctx.fillStyle='#0a0e0b';ctx.fill();
    ctx.strokeStyle='#d4af37';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#d4af37';ctx.font='bold 11px Inter';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('🎡',cx,cy);
    // Ball marker
    ctx.beginPath();ctx.arc(cx,cy-r+6,5,0,2*Math.PI);
    ctx.fillStyle='#fff';ctx.fill();
  }

  function spin(){
    if(S.spinning||S.bet<=0)return;
    if(S.credits<S.bet){toast('Créditos insuficientes','err');return;}
    S.credits-=S.bet;document.getElementById('rl-cr').textContent=S.credits;
    S.spinning=true;document.getElementById('rl-spin').disabled=true;
    const result=0|Math.random()*37;
    const tIdx=ORDER.indexOf(result);
    const tAngle=tIdx*(2*Math.PI/37);
    const spins=5+Math.random()*3;
    const endAngle=-(tAngle+spins*2*Math.PI);
    const startAngle=angle,dur=3600,start=performance.now();
    function animate(now){
      const p=Math.min((now-start)/dur,1);
      const ease=1-Math.pow(1-p,4);
      angle=startAngle+(endAngle-startAngle)*ease;
      drawWheel(angle);
      if(p<1)raf=requestAnimationFrame(animate);
      else{S.spinning=false;showResult(result);}
    }
    raf=requestAnimationFrame(animate);
  }

  function showResult(num){
    const isRed=RED.includes(num);
    const col=num===0?'#56d364':isRed?'#f85149':'var(--wh)';
    const lbl=num===0?'Verde 0':isRed?`Rojo ${num}`:`Negro ${num}`;
    S.last.unshift(num);if(S.last.length>10)S.last.length=10;
    document.getElementById('rl-hist').textContent='Últimos: '+S.last.join(' · ');

    let win=0,won=false;
    if(S.betType==='num'){won=num===S.betNum;if(won)win=S.bet*35;}
    else if(S.betType==='red'){won=isRed&&num!==0;if(won)win=S.bet;}
    else if(S.betType==='black'){won=!isRed&&num!==0;if(won)win=S.bet;}
    else if(S.betType==='even'){won=num!==0&&num%2===0;if(won)win=S.bet;}
    else if(S.betType==='odd'){won=num%2!==0&&num!==0;if(won)win=S.bet;}
    else if(S.betType==='low'){won=num>=1&&num<=18;if(won)win=S.bet;}
    else if(S.betType==='high'){won=num>=19&&num<=36;if(won)win=S.bet;}
    else if(S.betType==='doz1'){won=num>=1&&num<=12;if(won)win=S.bet*2;}
    else if(S.betType==='doz2'){won=num>=13&&num<=24;if(won)win=S.bet*2;}
    else if(S.betType==='doz3'){won=num>=25&&num<=36;if(won)win=S.bet*2;}

    if(won){S.credits+=S.bet+win;if(win>S.bet)confetti(30);}
    document.getElementById('rl-cr').textContent=S.credits;
    document.getElementById('rl-result').innerHTML=
      `<span style="color:${col};font-family:var(--fd)">${lbl}</span> `+
      (won?`<span style="color:#56d364">+${win} créditos</span>`:`<span style="color:#f85149">−${S.bet} créditos</span>`);
    recordResult('ruleta',won?'win':'loss',{num,bet:S.bet,win});
    document.getElementById('rl-spin').disabled=false;
    S.bet=0;document.getElementById('rl-bet').textContent=0;
  }

  render();
  return{id:'ruleta',destroy(){if(raf)cancelAnimationFrame(raf);}};
}

function helpRuleta(){return`
<h4>Ruleta Europea</h4>
<p>La rueda tiene 37 números (0–36). El 0 es verde; del 1 al 36 alternados en rojo y negro.</p>
<h4>Cómo jugar</h4>
<ul>
  <li>Elige un <strong>tipo de apuesta</strong> tocando un botón o un número directo.</li>
  <li>Selecciona la cantidad con los chips.</li>
  <li>Pulsa <strong>Girar</strong> y espera el resultado.</li>
</ul>
<h4>Tipos de apuesta y pagos</h4>
<table>
<tr><th>Apuesta</th><th>Descripción</th><th>Pago</th></tr>
<tr><td>Número exacto</td><td>Un número del 0 al 36</td><td>35:1</td></tr>
<tr><td>Rojo / Negro</td><td>Color de la casilla</td><td>1:1</td></tr>
<tr><td>Par / Impar</td><td>Número par o impar (0 no cuenta)</td><td>1:1</td></tr>
<tr><td>1–18 / 19–36</td><td>Mitad baja o alta</td><td>1:1</td></tr>
<tr><td>Docena</td><td>1–12, 13–24 o 25–36</td><td>2:1</td></tr>
</table>
<div class="tip">💡 El 0 solo gana a quien apostó directamente al 0. La ventaja de la casa es 2.7%.</div>`;}
