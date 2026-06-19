// stats.js — Estadísticas por juego + exportar/importar
const SKEY='casino_royal_v1';
const GIDS=['adivina','blackjack','memory','cards2048','poker','yahtzee','ruleta','slots','guerra','bingo','solitario'];

function dgs(){return{played:0,wins:0,losses:0,draws:0,streak:0,best:0,history:[]};}

function loadStats(){
  try{
    const r=localStorage.getItem(SKEY);
    if(!r) return _def();
    const d=JSON.parse(r);
    for(const id of GIDS) if(!d[id]) d[id]=dgs();
    return d;
  }catch{return _def();}
}

function _def(){const d={};for(const id of GIDS)d[id]=dgs();return d;}

function saveStats(d){try{localStorage.setItem(SKEY,JSON.stringify(d));}catch{}}

function recordResult(gid,result,meta={}){
  const all=loadStats(),g=all[gid];
  g.played++;
  if(result==='win'){g.wins++;g.streak++;if(g.streak>g.best)g.best=g.streak;}
  else if(result==='loss'){g.losses++;g.streak=0;}
  else{g.draws++;g.streak=0;}
  g.history.unshift({date:new Date().toISOString(),result,...meta});
  if(g.history.length>30) g.history.length=30;
  saveStats(all);
  return all;
}

function getStats(gid){return loadStats()[gid];}
function winRate(g){return g.played?Math.round(g.wins/g.played*100):0;}

function exportStats(){
  const b=new Blob([JSON.stringify(loadStats(),null,2)],{type:'application/json'});
  const u=URL.createObjectURL(b),a=document.createElement('a');
  a.href=u;a.download=`casino_stats_${new Date().toISOString().slice(0,10)}.json`;
  a.click();URL.revokeObjectURL(u);
}

async function importStats(file){
  return new Promise(res=>{
    const r=new FileReader();
    r.onload=e=>{
      try{
        const d=JSON.parse(e.target.result);
        if(typeof d!=='object'||Array.isArray(d)){res({ok:false,msg:'Formato inválido'});return;}
        const m=_def();
        for(const id of GIDS) if(d[id]) m[id]={...dgs(),...d[id]};
        saveStats(m);res({ok:true,msg:'Estadísticas importadas'});
      }catch{res({ok:false,msg:'JSON inválido'});}
    };
    r.onerror=()=>res({ok:false,msg:'Error de lectura'});
    r.readAsText(file);
  });
}

function clearStats(){localStorage.removeItem(SKEY);}
