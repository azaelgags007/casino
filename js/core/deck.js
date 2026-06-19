// deck.js — Baraja inglesa + utilidades compartidas
const SUITS=[{n:'spades',s:'♠',c:'black'},{n:'hearts',s:'♥',c:'red'},{n:'diamonds',s:'♦',c:'red'},{n:'clubs',s:'♣',c:'black'}];
const RANKS=[{n:'A',v:1},{n:'2',v:2},{n:'3',v:3},{n:'4',v:4},{n:'5',v:5},{n:'6',v:6},{n:'7',v:7},{n:'8',v:8},{n:'9',v:9},{n:'10',v:10},{n:'J',v:11},{n:'Q',v:12},{n:'K',v:13}];

function buildDeck(){
  const d=[];
  for(const s of SUITS) for(const r of RANKS)
    d.push({id:`${r.n}-${s.n}`,rank:r.n,val:r.v,suit:s.n,sym:s.s,color:s.c});
  return d;
}

function shuffle(a){
  const b=[...a];
  for(let i=b.length-1;i>0;i--){const j=0|Math.random()*(i+1);[b[i],b[j]]=[b[j],b[i]];}
  return b;
}

function cardFaceHTML(c){
  return `<div class="cc tl"><span class="cr2">${c.rank}</span><span class="cs2">${c.sym}</span></div><span class="csc">${c.sym}</span><div class="cc br"><span class="cr2">${c.rank}</span><span class="cs2">${c.sym}</span></div>`;
}

// faceDown=true → carta boca abajo, cp=true → cursor pointer
function mkCard(c,{fd=false,cp=false}={}){
  const el=document.createElement('div');
  el.className=`card ${c.color}${cp?' cp':''}`;
  el.dataset.id=c.id;
  el.innerHTML=`<div class="cb"></div><div class="cf">${cardFaceHTML(c)}</div>`;
  if(!fd) el.classList.add('fu'); // fu = face-up (rotateY 180deg via CSS)
  return el;
}

function flipUp(el,delay=0){
  return new Promise(r=>{
    setTimeout(()=>{
      el.style.transition='transform .5s var(--eout)';
      el.classList.add('fu');
      setTimeout(r,560);
    },delay);
  });
}

function flipDown(el,delay=0){
  return new Promise(r=>{
    setTimeout(()=>{
      el.style.transition='transform .5s var(--eout)';
      el.classList.remove('fu');
      setTimeout(r,560);
    },delay);
  });
}

// Genera HTML de pips para dados
function diePips(v){
  const p='<div class="pip"></div>';
  const m={1:p,2:p+p,3:p+p+p,4:p+p+p+p,5:p+p+p+p+p,6:p+p+p+p+p+p};
  return `<div class="dpips d${v}">${m[v]||''}</div>`;
}
