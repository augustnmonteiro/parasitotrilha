/* Eventos imutáveis em chaves distintas: duas abas não sobrescrevem o estudo uma da outra. */
const Learning = (() => {
  const KEY='parasitotrilha-estudo-v1', PREFIX='parasitotrilha-evento-v2:', DAY=86400000;
  const intervals=[1,3,7,14,30], events=new Map();
  let storageOK=true, progress;
  const empty=()=>({version:1,cards:{},cycles:{},cases:{},sessions:0});
  const validRecord=r=>r&&['seen','lapses','level','due','lastReview','reviews'].every(k=>Number.isSafeInteger(r[k])&&r[k]>=0)&&r.level<=5;
  const valid=p=>p?.version===1&&p.cards&&!Array.isArray(p.cards)&&p.cycles&&!Array.isArray(p.cycles)&&Number.isSafeInteger(p.sessions)&&p.sessions>=0
    &&Object.entries(p.cards).every(([id,r])=>String(Number(id))===id&&CARDS[id]&&CARDS[id].kind!=='parasite'&&validRecord(r))
    &&Object.entries(p.cycles).every(([f,r])=>FAMILIES[f]&&r&&Number.isSafeInteger(r.attempts)&&r.attempts>=0&&Number.isSafeInteger(r.correct)&&r.correct>=0&&r.correct<=r.attempts);
  const knownConcept=uid=>typeof uid==='string'&&Object.hasOwn(CARD_BY_UID,uid)&&CARD_BY_UID[uid].kind!=='parasite';
  const validEvent=e=>e&&typeof e.eventId==='string'&&/^[\w:-]{1,160}$/.test(e.eventId)&&Number.isSafeInteger(e.at)&&e.at>=0&&(
    e.type==='seed'&&knownConcept(e.uid)&&validRecord(e.record)
    ||e.type==='seed-cycle'&&FAMILY_KEYS.includes(e.family)&&Number.isSafeInteger(e.attempts)&&Number.isSafeInteger(e.correct)&&e.correct>=0&&e.attempts>=e.correct
    ||['expose','rate'].includes(e.type)&&knownConcept(e.uid)&&(e.type==='expose'?typeof e.correct==='boolean':['good','hard','again'].includes(e.grade))
    ||e.type==='cycle'&&FAMILY_KEYS.includes(e.family)&&typeof e.correct==='boolean'
    ||e.type==='case'&&typeof e.caseKey==='string'&&/^caso-\d{1,6}$/.test(e.caseKey)&&FAMILY_KEYS.includes(e.family)&&FAMILY_KEYS.includes(e.chosenFamily)&&typeof e.correct==='boolean'
    ||e.type==='finish');
  function readEvents(){
    try{
      for(let i=0;i<localStorage.length;i++){
        const key=localStorage.key(i);if(!key?.startsWith(PREFIX)||events.has(key.slice(PREFIX.length)))continue;
        try{const e=JSON.parse(localStorage.getItem(key));if(validEvent(e)&&key===PREFIX+e.eventId)events.set(e.eventId,e);}catch{storageOK=false;}
      }
    }catch{storageOK=false;}
  }
  function storeEvent(e){events.set(e.eventId,e);try{localStorage.setItem(PREFIX+e.eventId,JSON.stringify(e));storageOK=true;}catch{storageOK=false;}}
  function fold(){
    progress=empty();
    const ensure=(id,at)=>progress.cards[id]||=( {seen:0,lapses:0,level:0,due:at,lastReview:0,reviews:0});
    for(const e of [...events.values()].sort((a,b)=>a.at-b.at||a.eventId.localeCompare(b.eventId))){
      const id=CARD_BY_UID[e.uid]?.id;
      if(e.type==='seed'){progress.cards[id]={...e.record};continue;}
      if(e.type==='finish'){progress.sessions++;continue;}
      if(e.type==='case'){
        const r=progress.cases[e.caseKey]||={attempts:0,correct:0,confusions:{}};
        r.attempts++;if(e.correct)r.correct++;if(e.family!==e.chosenFamily)r.confusions[e.chosenFamily]=(r.confusions[e.chosenFamily]||0)+1;
        continue;
      }
      if(e.type==='cycle'||e.type==='seed-cycle'){
        const f=FAMILY_KEYS.indexOf(e.family),r=progress.cycles[f]||={attempts:0,correct:0};
        r.attempts+=e.type==='seed-cycle'?e.attempts:1;r.correct+=e.type==='seed-cycle'?e.correct:e.correct?1:0;continue;
      }
      const r=ensure(id,e.at);
      if(e.type==='expose'){r.seen++;if(!e.correct){r.lapses++;r.level=0;r.due=e.at;}continue;}
      const eligible=!r.lastReview||e.at>=r.due&&new Date(e.at).toDateString()!==new Date(r.lastReview).toDateString();
      let days=1;
      if(e.grade==='again'){r.level=0;r.lapses++;}
      else if(e.grade==='hard')r.level=Math.min(r.level,1);
      else if(eligible){r.level=Math.min(5,r.level+1);days=intervals[r.level-1];}
      else days=intervals[Math.max(0,r.level-1)];
      const next=e.at+days*DAY;
      r.due=e.grade==='good'&&!eligible?Math.min(r.due,next):next;
      // Recordação antecipada não altera o último dia que qualificou para progressão.
      if(eligible||e.grade!=='good')r.lastReview=e.at;
      r.reviews++;r.seen=Math.max(1,r.seen);
    }
  }
  readEvents();
  try{
    const old=JSON.parse(localStorage.getItem(KEY));
    if(valid(old)){
      for(const [id,r] of Object.entries(old.cards)){
        const eventId='legado:'+CARDS[id].uid;
        if(!events.has(eventId))storeEvent({eventId,type:'seed',uid:CARDS[id].uid,at:0,record:r});
      }
      for(const [f,r] of Object.entries(old.cycles)){
        const eventId='legado-ciclo:'+FAMILY_KEYS[f];if(!events.has(eventId))storeEvent({eventId,type:'seed-cycle',family:FAMILY_KEYS[f],at:0,...r});
      }
    }
  }catch{storageOK=false;}
  fold();
  let sequence=0;
  const tabId=globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now().toString(36);
  function append(data,at=Date.now()){
    readEvents();const e={...data,at,eventId:at.toString(36)+':'+tabId+':'+String(sequence++).padStart(8,'0')};
    if(!validEvent(e))throw Error('Registro de estudo inválido.');storeEvent(e);fold();
  }
  const record=id=>progress.cards[id]||null;
  function expose(id,correct,now=Date.now()){append({type:'expose',uid:CARDS[id]?.uid,correct},now);}
  function rate(id,grade,now=Date.now()){append({type:'rate',uid:CARDS[id]?.uid,grade},now);return {...record(id),days:Math.max(1,Math.ceil((record(id).due-now)/DAY))};}
  function due(now=Date.now()){return Object.keys(progress.cards).map(Number).filter(id=>record(id).due<=now).sort((a,b)=>record(a).due-record(b).due||Math.min(3,record(b).lapses)-Math.min(3,record(a).lapses)||a-b);}
  function interleave(ids){
    const groups=new Map();for(const id of ids){const f=CARDS[id].family;if(!groups.has(f))groups.set(f,[]);groups.get(f).push(id);}
    const result=[];while([...groups.values()].some(a=>a.length))for(const list of groups.values())if(list.length)result.push(list.shift());return result;
  }
  function queue(family=null,now=Date.now(),limit=10,mode='scheduled',kind='all'){
    const eligible=CARDS.filter(c=>c.kind!=='parasite'&&(family===null||c.family===family)&&(kind==='all'||c.kind===kind)).map(c=>c.id);
    const pending=interleave(due(now).filter(id=>eligible.includes(id)));
    const fresh=interleave(eligible.filter(id=>!record(id)));
    const early=interleave(eligible.filter(id=>record(id)&&record(id).due>now).sort((a,b)=>record(a).due-record(b).due));
    return [...pending,...fresh,...(mode==='free'?early:[])].slice(0,Math.max(1,Math.min(30,limit)));
  }
  function status(id,now=Date.now()){const r=record(id);return !r?'new':r.due<=now?'due':r.level>=3?'retained':'learning';}
  function summary(family=null,now=Date.now()){
    const ids=CARDS.filter(c=>c.kind!=='parasite'&&(family===null||c.family===family)).map(c=>c.id);
    return {total:ids.length,seen:ids.filter(id=>record(id)).length,due:ids.filter(id=>record(id)?.due<=now).length,retained:ids.filter(id=>record(id)?.level>=3).length};
  }
  function importEntries(data){
    if(data?.format!=='parasitotrilha-aprendizado-v2'||!Array.isArray(data.events)||data.events.length>100000||!data.events.every(validEvent)||new Set(data.events.map(e=>e.eventId)).size!==data.events.length)throw Error('O arquivo não contém um histórico válido de Parasitotrilha.');
    return data.events.filter(e=>!localStorage.getItem(PREFIX+e.eventId)).map(e=>[PREFIX+e.eventId,JSON.stringify(e)]);
  }
  function merge(data){
    if(data?.format!=='parasitotrilha-aprendizado-v2'||!Array.isArray(data.events)||data.events.length>100000||!data.events.every(validEvent))throw Error('O arquivo não contém um histórico válido de Parasitotrilha.');
    readEvents();for(const e of data.events)if(!events.has(e.eventId))storeEvent(e);fold();
  }
  return {record,expose,rate,due,queue,status,summary,valid,merge,importEntries,
    sync:()=>{readEvents();fold();},
    cycle:(f,correct)=>append({type:'cycle',family:FAMILY_KEYS[f],correct}),
    caseResult:(key,f,chosen,correct)=>append({type:'case',caseKey:key,family:FAMILY_KEYS[f],chosenFamily:FAMILY_KEYS[chosen],correct}),
    cycleRecord:f=>progress.cycles[f]||{attempts:0,correct:0},
    caseRecord:key=>progress.cases[key]||{attempts:0,correct:0,confusions:{}},
    finish:()=>append({type:'finish'}),storageOK:()=>storageOK,
    backup:()=>({format:'parasitotrilha-aprendizado-v2',contentVersion:CONTENT_VERSION,events:[...events.values()]}),
    export:()=>JSON.parse(JSON.stringify(progress))};
})();
