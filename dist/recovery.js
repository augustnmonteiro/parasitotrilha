/* Persistência de rascunhos e backups completos. Importação valida tudo antes de gravar. */
const Recovery=(()=>{
 const DRAFT_PREFIX='parasitotrilha-rascunho-v3:',ROUND_PREFIX='parasitotrilha-partida-',FAVORITE_PREFIX='parasitotrilha-favorito:';
 const identifier=x=>typeof x==='string'&&/^[a-zA-Z0-9-]{1,160}$/.test(x);
 const freshId=()=>globalThis.crypto?.randomUUID?.()||'d'+Date.now().toString(36)+Math.random().toString(36).slice(2);
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const unique=a=>Array.isArray(a)&&new Set(a).size===a.length;
 const family=f=>Number.isInteger(f)&&!!FAMILIES[f];
 const card=id=>Number.isInteger(id)&&!!CARDS[id];
 const conceptId=id=>card(id)&&CARDS[id].kind!=='parasite';
 let activeId=null;
 function validExercise(type,s){
  if(!s||typeof s!=='object'||Array.isArray(s))return false;
  if(type==='recall')return Array.isArray(s.queue)&&s.queue.length>0&&s.queue.length<=60&&s.queue.every(conceptId)
   &&Number.isInteger(s.index)&&s.index>=0&&s.index<s.queue.length&&(s.family===null||family(s.family))
   &&typeof s.revealed==='boolean'&&typeof s.notes==='string'&&s.notes.length<=20000
   &&Array.isArray(s.results)&&s.results.length===s.index&&s.results.every((r,i)=>r&&r.id===s.queue[i]&&['again','hard','good'].includes(r.grade))
   &&unique(s.retried)&&s.retried.every(id=>s.queue.includes(id))&&s.retried.length<=30
   &&Number.isInteger(s.originalCount)&&s.originalCount>0&&s.originalCount<=30;
  if(type==='cycle')return family(s.family)&&s.checked===false&&unique(s.bank)&&s.bank.length===CYCLES[s.family].length&&s.bank.every(i=>Number.isInteger(i)&&i>=0&&i<CYCLES[s.family].length)
   &&unique(s.order)&&s.order.length<=s.bank.length&&s.order.every(i=>s.bank.includes(i));
  if(type==='case'){
   if(!Number.isInteger(s.index)||!CASES[s.index]||s.checked!==false)return false;
   const c=CASES[s.index],expected=[concept(c.family,'parasite').id,formCard(c.family).id,concept(c.family,'diagnosis').id];
   const bank=[c.family,...c.others].flatMap(f=>[concept(f,'parasite').id,formCard(f).id,concept(f,'diagnosis').id]);
   return unique(s.bank)&&s.bank.length===bank.length&&s.bank.every(id=>bank.includes(id))&&same(s.expected,expected)
    &&Array.isArray(s.placed)&&s.placed.length===3&&unique(s.placed.filter(id=>id!==null))
    &&s.placed.every((id,i)=>id===null||s.bank.includes(id)&&(i===0?CARDS[id].kind==='parasite':i===2?CARDS[id].kind==='diagnosis':['egg','stage'].includes(CARDS[id].kind)))
    &&(s.selected===null||s.bank.includes(s.selected)&&!s.placed.includes(s.selected));
  }
  return false;
 }
 function validDraft(d){return d?.version===3&&identifier(d.id)&&Number.isSafeInteger(d.updatedAt)&&d.updatedAt>=0&&(d.complete===true||d.complete===false&&validExercise(d.type,d.data));}
 function records(prefix){
  const found=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!key?.startsWith(prefix))continue;try{found.push({key,value:JSON.parse(localStorage.getItem(key))});}catch{}}
  return found;
 }
 function allDrafts(){return records(DRAFT_PREFIX).map(r=>r.value).filter(validDraft);}
 function drafts(){migrateDraft();return allDrafts().filter(d=>!d.complete).sort((a,b)=>b.updatedAt-a.updatedAt||a.id.localeCompare(b.id));}
 function saveDraft(type,data){
  if(!validExercise(type,data))return false;
  data._draftId ||= freshId();activeId=data._draftId;
  const d={version:3,id:activeId,updatedAt:Date.now(),complete:false,type,data:clone(data)};
  localStorage.setItem(DRAFT_PREFIX+d.id,JSON.stringify(d));return true;
 }
 function finishDraft(){
  if(!activeId)return;
  localStorage.setItem(DRAFT_PREFIX+activeId,JSON.stringify({version:3,id:activeId,updatedAt:Date.now(),complete:true}));activeId=null;
 }
 function migrateDraft(){
  try{
   const old=JSON.parse(sessionStorage.getItem('parasitotrilha-exercicio-v2'));
   if(old?.version===2&&validExercise(old.type,old.data)){
    const wasActive=activeId;old.data._draftId='legado-exercicio';
    if(!localStorage.getItem(DRAFT_PREFIX+old.data._draftId))saveDraft(old.type,old.data);
    activeId=wasActive;sessionStorage.removeItem('parasitotrilha-exercicio-v2');
   }
  }catch{}
 }
 function resumeDraft(id){
  const old=drafts().find(d=>d.id===id);if(!old)return null;
  // Cada aba trabalha em sua própria cópia. Se outra aba ainda edita a anterior, ela a preserva.
  const data=clone(old.data);data._draftId=freshId();saveDraft(old.type,data);
  const current=JSON.parse(localStorage.getItem(DRAFT_PREFIX+id));
  if(same(current,old))localStorage.setItem(DRAFT_PREFIX+id,JSON.stringify({version:3,id,updatedAt:Date.now(),complete:true}));
  return {type:old.type,data};
 }
 function roundRecords(){return records(ROUND_PREFIX).filter(r=>validState(r.value));}
 function fullBackup(){
  Learning.sync();migrateDraft();
  const rounds=[clone(state),...roundRecords().map(r=>r.value)].filter((s,i,a)=>a.findIndex(x=>same(x,s))===i);
  return {format:'parasitotrilha-backup-v3',contentVersion:CONTENT_VERSION,exportedAt:new Date().toISOString(),learning:Learning.backup(),rounds,
   favorites:CARDS.filter(c=>localStorage.getItem(FAVORITE_PREFIX+c.uid)==='1').map(c=>c.uid),drafts:allDrafts()};
 }
 function validateBackup(data){
  if(data?.format==='parasitotrilha-aprendizado-v2'){Learning.importEntries(data);return 'legacy';}
  if(data?.format!=='parasitotrilha-backup-v3')throw Error('Este arquivo não é um backup do Parasitotrilha.');
  Learning.importEntries(data.learning);
  if(!Array.isArray(data.rounds)||data.rounds.length>1000||!data.rounds.every(validState))throw Error('O backup contém uma partida inválida. Nada foi importado.');
  if(!unique(data.favorites)||!data.favorites.every(uid=>typeof uid==='string'&&Object.hasOwn(CARD_BY_UID,uid)))throw Error('O backup contém favoritos inválidos. Nada foi importado.');
  if(!Array.isArray(data.drafts)||data.drafts.length>10000||!data.drafts.every(validDraft)||!unique(data.drafts.map(d=>d.id)))throw Error('O backup contém um exercício inválido. Nada foi importado.');
  return 'full';
 }
 function importBackup(data){
  const kind=validateBackup(data),entries=new Map(Learning.importEntries(kind==='legacy'?data:data.learning));
  let addedRounds=0,addedDrafts=0,addedFavorites=0;
  if(kind==='full'){
   const existingRounds=[state,...roundRecords().map(r=>r.value)];
   for(const incoming of data.rounds){
    if(existingRounds.some(s=>same(s,incoming)))continue;
    let n=1,key;do{key=ROUND_PREFIX+'importada-'+(incoming.roundId||'antiga')+'-'+n++;}while(localStorage.getItem(key)||entries.has(key));
    entries.set(key,JSON.stringify(incoming));existingRounds.push(incoming);addedRounds++;
   }
   for(const uid of data.favorites)if(localStorage.getItem(FAVORITE_PREFIX+uid)!=='1'){entries.set(FAVORITE_PREFIX+uid,'1');addedFavorites++;}
   const existingDrafts=allDrafts();
   for(const incoming of data.drafts){
    const current=existingDrafts.find(d=>d.id===incoming.id);
    if(current?.complete||current&&same(current,incoming))continue;
    let d=clone(incoming);
    if(current){
     // Um backup não apaga um rascunho diferente já presente. Guardar as duas versões é reversível.
     if(d.complete||existingDrafts.some(x=>!x.complete&&x.type===d.type&&same({...x.data,_draftId:null},{...d.data,_draftId:null})))continue;
     d.id=freshId();d.data._draftId=d.id;
    }
    entries.set(DRAFT_PREFIX+d.id,JSON.stringify(d));existingDrafts.push(d);if(!d.complete)addedDrafts++;
   }
  }
  const written=[];
  try{
   for(const [key,value] of entries){const before=localStorage.getItem(key);localStorage.setItem(key,value);written.push({key,value,before});}
  }catch{
   let rolledBack=true;
   for(const r of written.reverse())try{if(localStorage.getItem(r.key)===r.value){if(r.before===null)localStorage.removeItem(r.key);else localStorage.setItem(r.key,r.before);}}catch{rolledBack=false;}
   throw Error(rolledBack?'Não há espaço ou permissão para importar. Nenhum dado foi alterado.':'A importação foi interrompida. Alguns registros podem ter sido adicionados; os dados anteriores não foram descartados.');
  }
  Learning.sync();return {kind,addedRounds,addedDrafts,addedFavorites};
 }
 return {validExercise,validDraft,drafts,saveDraft,finishDraft,resumeDraft,fullBackup,validateBackup,importBackup,roundRecords};
})();
