const fs = require('fs'), vm = require('vm'), assert = require('assert');
const elements = new Map();
function el(id) {
  if (!elements.has(id)) elements.set(id, {innerHTML:'',textContent:'',hidden:false,open:false,value:id.endsWith('filter')?'all':'',style:{},dataset:{},classList:{toggle(){}},setAttribute(){},addEventListener(){},focus(){},scrollIntoView(){},querySelector(){return el('stub')},querySelectorAll(){return []},showModal(){this.open=true},close(){this.open=false}});
  return elements.get(id);
}
const registered = [], memory = new Map();
const ctx = {document:{getElementById:el,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},modelContext:{registerTool:t=>registered.push(t)}},localStorage:{get length(){return memory.size},key:i=>[...memory.keys()][i],getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},setTimeout,window:{addEventListener(){}},AbortController,console};
vm.createContext(ctx);
for (const f of ['cards','curriculum','knowledge','associations','engine','learning','game','study','recovery','tools','microscopy']) vm.runInContext(fs.readFileSync(`dist/${f}.js`,'utf8'),ctx);
const run = x => vm.runInContext(x,ctx);
assert.equal(run('CARDS.length'),200); assert.equal(run('FAMILIES.length'),20);
for (const c of run('CARDS')) { assert(c.title && c.description && c.explanation); assert(c.source.startsWith('https://')); assert(!('rank' in c)); }
for (let f=0;f<20;f++) assert.equal(run(`CARDS.filter(c=>c.family===${f}).length`),10);
for (const d of ['helmintos','intestino','cestodeos','vetores','diversidade','misto']) {
  run(`reset('${d}')`); assert.equal(run('total()'),36); assert(run('validState(state)'));
  run(`for(let i=0;i<40;i++){const b=Solitaire.create('${d}');for(let n=0;n<40;n++){if(!Solitaire.valid(b))throw Error('Mesa inconsistente');let from;if(b.waste.length)from={zone:'waste'};else{const col=b.columns.findIndex(c=>c.length);if(col>=0)from={zone:'column',col,index:b.columns[col].length-1}}if(from){const id=Solitaire.stack(b,from)[0];Solitaire.move(b,from,{zone:'foundation',pile:b.families.indexOf(CARDS[id].family)})}else Solitaire.draw(b);if(n%2===0)Solitaire.draw(b)}if(!Solitaire.valid(b))throw Error('Cartas perdidas')}`);
}
const fixture = `reset('helmintos');state.board.columns=[[],[],[],[]];state.board.stock=state.board.deckIds.filter(id=>CARDS[id].kind!=='parasite').reverse();state.board.waste=[];state.history=[];`;
run(fixture+"draw();selected={zone:'waste'};destination({zone:'foundation',pile:1})");
assert.equal(run('state.coins'),90); assert.equal(run('completed()'),0); assert(run('blocked()')); assert(el('feedback-dialog').open);
run("destination({zone:'foundation',pile:1});draw()"); assert.equal(run('state.coins'),90); assert.equal(run('state.board.waste.at(-1)'),1);
run("dismissFeedback();selected={zone:'waste'};destination({zone:'foundation',pile:0})");
assert.equal(run('state.coins'),90); assert.equal(run('completed()'),1); assert(!run('blocked()')); assert(run('validState(state)'));
run("undo();selected={zone:'waste'};destination({zone:'foundation',pile:0})"); assert.equal(run('state.coins'),90); assert.equal(run('completed()'),1);
// Uma sequência move em conjunto e cada carta recompensa apenas uma vez.
run(fixture+"state.board.stock=state.board.stock.filter(id=>![1,2,7].includes(id));state.board.columns[0]=[{id:7,up:false},{id:1,up:true}];state.board.columns[1]=[{id:2,up:true}];selected={zone:'column',col:0,index:1};destination({zone:'column',col:1})");
assert.equal(run('state.coins'),120); assert(run('state.board.columns[0][0].up')); assert(run('validState(state)'));
run("selected={zone:'column',col:1,index:0};destination({zone:'foundation',pile:0})"); assert.equal(run('state.coins'),140); assert.equal(run('completed()'),2);
// Vitória em cada baralho, inclusive quando as famílias não são 0..3.
for (const deck of ['helmintos','intestino','cestodeos','vetores','diversidade','misto']) {
  run(`reset('${deck}');state.board.columns=[[],[],[],[]];state.board.stock=state.board.deckIds.filter(id=>CARDS[id].kind!=='parasite').reverse();for(let n=0;n<36;n++){draw();selected={zone:'waste'};const id=selectedIds()[0];destination({zone:'foundation',pile:state.board.families.indexOf(CARDS[id].family)})}`);
  assert.equal(run('completed()'),36); assert.equal(run('state.coins'),940); assert(run('ended()')); assert(run('validState(state)'));
}
run(fixture+"draw();for(let n=0;n<10;n++){selected={zone:'waste'};destination({zone:'foundation',pile:1});dismissFeedback()}"); assert.equal(run('state.coins'),0); assert(run('ended()')); run('draw();undo()'); assert.equal(run('state.coins'),0);
// Dicas bloqueiam a mesa enquanto abertas, restauram a seleção e não cobram de novo.
run(fixture+"draw();pick({zone:'waste'});hint()"); assert.equal(run('state.coins'),95); assert(run('blocked()')); run('dismissFeedback()'); assert.equal(run('selected.zone'),'waste'); run('hint();dismissFeedback()'); assert.equal(run('state.coins'),95);
run('state.coins=5;state.hinted=[];hint()'); assert.equal(run('state.coins'),5); assert(!run('ended()')); run('dismissFeedback()');
// Recuperação sem alternativas exige revelar antes de autoavaliar, sem cobrar moedas.
run(fixture+"startRecall(0);rateRecall('good')");assert.equal(run('recallSession.index'),0);
const balance=run('state.coins');run("revealRecall();rateRecall('good')");assert.equal(run('recallSession.index'),1);assert.equal(run('state.coins'),balance);
// Migração mantém as 24 cartas e a pontuação da partida anterior, sem inserir cartas novas.
run(`const old={version:3,board:{columns:[[],[],[],[]],stock:Array.from({length:24},(_,i)=>i).filter(i=>i%6!==0&&i!==1),waste:[],foundations:[[0,1],[6],[12],[18]]},coins:120,attempts:1,streak:1,mastered:[1],errors:[],reviewed:[],hinted:[],history:[],feedback:null};const migrated=migrate(old);`);
assert.equal(run('migrated.coins'),120); assert.equal(run('migrated.board.deckIds.length'),24); assert(run('validState(migrated)')); assert.equal(run('migrated.board.foundations[0].length'),2);
assert(!run('validState({...state,coins:-1})')); assert(!run('Solitaire.valid({...state.board,stock:[1,1]})'));
// Busca não diferencia acentos, combina filtros e apresenta estado vazio.
el('library-search').value='hipnozoito';run('library()');assert(el('library-grid').innerHTML.includes('Hipnozoíto'));
el('library-search').value='zzzz-inexistente';run('library()');assert(el('library-grid').innerHTML.includes('Nenhuma carta'));
el('library-search').value='';el('family-filter').value='4';el('kind-filter').value='cycle';run('library()');assert(el('library-count').textContent.startsWith('1 carta'));assert(el('library-grid').innerHTML.includes('Desencistar'));
assert.equal(registered.length,4);assert.throws(()=>registered.find(t=>t.name==='associar_cartas').execute({origem:{zone:'column',col:99,index:0},destino:{zone:'foundation',pile:0}}));
run(fixture);registered.find(t=>t.name==='comprar_carta').execute({});registered.find(t=>t.name==='associar_cartas').execute({origem:{zone:'waste'},destino:{zone:'foundation',pile:0}});assert.equal(run('state.coins'),120);
const html=fs.readFileSync('dist/index.html','utf8');for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(!m[1].includes(':')&&m[1]!=='./')assert(fs.existsSync('dist/'+m[1].split('?')[0]),m[1])}
// Currículo íntegro: IDs permanentes, uma âncora por conjunto, cinco módulos cobrem tudo.
for(let f=0;f<20;f++) {
  assert.equal(run(`CARDS.filter(c=>c.family===${f}).length`),10);
  assert.equal(run(`CARDS.filter(c=>c.family===${f}&&c.kind==='parasite').length`),1);
  for(const kind of ['cycle','host','pitfall','diagnosis','symptom','transmission','prevention','habitat']) assert(run(`CARDS.some(c=>c.family===${f}&&c.kind==='${kind}')`));
  assert.equal(run(`CYCLES[${f}].length`),5);assert(run(`RELATIONS[${f}].length>20`));
}
assert.equal(run('new Set(Object.values(DECKS).filter(d=>d.families).flatMap(d=>d.families)).size'),20);
assert(run('CARDS.every((c,i)=>c.id===i&&KINDS[c.kind]&&c.related?.every(f=>FAMILIES[f]&&f!==c.family)!==false)'));
assert(!run("CARDS.some(c=>c.kind==='immune')"));
// Um vínculo verdadeiro compartilhado não causa perda nem pontua novamente.
run("reset('diversidade');state.board.columns=[[],[],[],[]];state.board.stock=state.board.deckIds.filter(id=>CARDS[id].kind!=='parasite'&&id!==52);state.board.waste=[52];selected={zone:'waste'};destination({zone:'foundation',pile:3})");
assert.equal(run('state.coins'),120);assert.equal(run('state.feedback.type'),'correct');assert(!run('blocked()'));assert(run('validState(state)'));assert(run('state.board.foundations[2].includes(52)'));
// A substituição de uma carta na migração não transforma resposta antiga em aprendizado novo.
run("const old4={...newState('helmintos'),version:4};old4.board.columns=[[],[],[],[]];old4.board.stock=old4.board.deckIds.filter(id=>CARDS[id].kind!=='parasite'&&id!==5);old4.board.foundations[0].push(5);old4.mastered=[5];old4.hinted=[5];old4.coins=123;const migrated4=migrate(old4)");
assert(run('validState(migrated4)'));assert.equal(run('migrated4.coins'),123);assert.equal(run('migrated4.mastered.length'),0);assert(run('migrated4.board.stock.includes(5)'));
// Montagem de ciclos: ordem incorreta, repetição bloqueada e acerto nos vinte conjuntos.
run('startCycle(0);cyclePick(0);cyclePick(0)');assert.equal(run('cycleSession.order.length'),1);
run('cyclePick(2);cyclePick(1);cyclePick(3);cyclePick(4);checkCycle()');assert(el('cycle-result').innerHTML.includes('Confira onde'));
const cycleAttempts=run('Learning.cycleRecord(0).attempts');run('checkCycle()');assert.equal(run('Learning.cycleRecord(0).attempts'),cycleAttempts);
for(let f=0;f<20;f++) {run(`startCycle(${f});for(let i=0;i<5;i++)cyclePick(i);checkCycle()`);assert(el('cycle-result').innerHTML.includes('Caminho reconstruído'));}
// Casos clínicos usam cartas reais e validam as três relações.
for(let i=0;i<21;i++) {run(`startCase(${i});for(let slot=0;slot<3;slot++){caseSession.selected=caseSession.expected[slot];placeCase(slot)}checkCase()`);assert(el('case-result').innerHTML.includes('As três cartas'));}
run('startCase(1);caseSession.selected=caseSession.expected[1];placeCase(0)');assert.equal(run('caseSession.placed[0]'),null);
run('caseSession.placed=[Solitaire.anchor(10),caseSession.expected[1],caseSession.expected[2]];checkCase()');assert(el('case-result').innerHTML.includes('reconstruir'));
run('startCase(4);caseSession.placed=[...caseSession.expected];caseSession.placed[2]=52;checkCase()');assert(el('case-result').innerHTML.includes('também é válida'));
// Aprendizado persistente: reconhecimento não promove retenção; espaçamento em dias reais.
run("const t0=Date.parse('2030-01-01T12:00:00Z'), day=86400000;Learning.expose(199,false,t0);Learning.rate(199,'good',t0)");
assert.equal(run('Learning.record(199).level'),1);assert.equal(run('Learning.record(199).due'),run('t0+day'));
run("Learning.rate(199,'good',t0+1000)");assert.equal(run('Learning.record(199).level'),1);assert.equal(run('Learning.record(199).due'),run('t0+day'));
run("Learning.rate(199,'good',t0+day)");assert.equal(run('Learning.record(199).level'),2);assert.equal(run('Learning.record(199).due'),run('t0+4*day'));
run("Learning.rate(199,'good',t0+4*day)");assert.equal(run('Learning.record(199).level'),3);assert.equal(run('Learning.status(199,t0+4*day)'),'retained');
run("Learning.expose(199,true,t0+5*day)");assert.equal(run('Learning.record(199).level'),3);
run("Learning.rate(199,'again',t0+11*day)");assert.equal(run('Learning.record(199).level'),0);assert.equal(run('Learning.record(199).due'),run('t0+12*day'));
assert(!run('Learning.due(t0+11*day).includes(199)'));assert(run('Learning.due(t0+12*day).includes(199)'));
run("Learning.rate(199,'hard',t0+12*day)");assert.equal(run('Learning.record(199).level'),0);
assert(run('Learning.valid(Learning.export())'));assert(!run('Learning.valid({...Learning.export(),cards:{99999:{}}})'));
assert.throws(()=>run("Learning.rate(199,'inventado')"));
const beforeNewRound=run('JSON.stringify(Learning.export())');run("reset('cestodeos')");assert.equal(run('JSON.stringify(Learning.export())'),beforeNewRound);
// Recarregamento real dos módulos no contexto de teste recupera o mesmo histórico.
const reloadCtx={...ctx,document:{...ctx.document,modelContext:null}};vm.createContext(reloadCtx);
for(const f of ['cards','curriculum','knowledge','associations','engine','learning','game','study','recovery','tools','microscopy']) vm.runInContext(fs.readFileSync(`dist/${f}.js`,'utf8'),reloadCtx);
assert.equal(vm.runInContext('JSON.stringify(Learning.export())',reloadCtx),beforeNewRound);
// Todas as telas e filtros devem renderizar com o novo conjunto de categorias.
run("for(const tab of ['atlas','compare','progress','cases']){studyTab=tab;setView('study')}for(let f=0;f<20;f++){atlasFamily=f;renderAtlas()}for(let i=0;i<COMPARISONS.length;i++){comparisonIndex=i;renderComparison()}");
assert(!el('study-tab-content').innerHTML.includes('undefined'));
console.log('OK: 200 cartas, 20 coleções, 6 baralhos, 9.600 ações de mesa, moedas, migração, 20 ciclos, 21 casos e revisão persistente com espaçamento.');
// Correções da auditoria: relação válida move, recompensa e mantém a mesa consistente.
run("reset('diversidade');state.board.columns=[[],[],[],[]];state.board.stock=state.board.deckIds.filter(id=>CARDS[id].kind!=='parasite'&&id!==53);state.board.waste=[53];selected={zone:'waste'};destination({zone:'foundation',pile:3})");
assert.equal(run('state.coins'),120);assert(run('state.board.foundations[2].includes(53)'));assert(run('validState(state)'));
// Cancelar arrasto não modifica a seleção nem pontua; clicar noutra carta só seleciona.
run(fixture+"draw();selected=null;const dragElement={};bindDrag(dragElement,{zone:'waste'});dragElement.ondragstart({dataTransfer:{setData(){}}});dragElement.ondragend();");
assert.equal(run('selected'),null);assert.equal(run('dragSource'),null);assert.equal(run('state.coins'),100);
assert(!fs.readFileSync('dist/game.js','utf8').includes("el.onclick = () => selected &&"));
run("pick({zone:'waste'});setView('study');setView('board')");assert.equal(run('selected'),null);assert(!el('foundations').innerHTML.includes('receiving'));
// Um erro seguido de correção não gera saldo positivo nem conta como acerto independente.
run(fixture+"draw();selected={zone:'waste'};destination({zone:'foundation',pile:1});dismissFeedback();selected={zone:'waste'};destination({zone:'foundation',pile:0})");
assert.equal(run('state.coins'),90);assert.equal(run('state.independent.length'),0);assert.equal(run('state.streak'),0);
run(fixture+"draw();pick({zone:'waste'});hint();dismissFeedback();destination({zone:'foundation',pile:0})");assert.equal(run('state.coins'),100);assert.equal(run('state.independent.length'),0);
// Nível alcançado continua contado quando a revisão vence.
run("Learning.rate(198,'good',t0);Learning.rate(198,'good',t0+day);Learning.rate(198,'good',t0+4*day)");
assert.equal(run('Learning.record(198).level'),3);assert.equal(run('Learning.summary(19,t0+11*day-1).retained'),run('Learning.summary(19,t0+11*day).retained'));
// Erro no parasito, mesmo com as outras cartas corretas, registra a confusão.
run('startCase(0);caseSession.placed=[Solitaire.anchor(3),caseSession.expected[1],caseSession.expected[2]];checkCase()');
assert(run("Learning.caseRecord('caso-0').confusions.trichuris>0"));
// Memória: repetição curta limitada, notas, rubrica e atualização imediata dos contadores.
run('startRecall(0,{ids:[1,2,3]});recallSession.notes="minha resposta";revealRecall();rateRecall("again")');
assert.equal(run('recallSession.queue.length'),4);assert.equal(run('recallSession.queue[3]'),1);
run('recallSession.index=3;revealRecall();rateRecall("again")');assert.equal(run('recallSession.queue.length'),4);
run('refreshLearningUI()');assert.equal(el('study-due').textContent,run('Learning.summary().due'));
// Abas independentes compartilham eventos sem perder registros, incluindo a mesma carta.
function learningTab(){const c={...ctx,document:{...ctx.document,modelContext:null}};vm.createContext(c);for(const f of ['cards','curriculum','knowledge','associations','learning'])vm.runInContext(fs.readFileSync(`dist/${f}.js`,'utf8'),c);return x=>vm.runInContext(x,c);}
const a=learningTab(),b=learningTab();const aBefore=a('Learning.record(180+1)?.seen||0'),bBefore=b('Learning.record(180+2)?.seen||0');
a('Learning.expose(181,true)');b('Learning.expose(182,true)');a('Learning.sync()');assert.equal(a('Learning.record(181).seen'),aBefore+1);assert.equal(a('Learning.record(182).seen'),bBefore+1);
const same=a('Learning.record(181).seen');a('Learning.expose(181,true)');b('Learning.expose(181,true)');a('Learning.sync()');assert.equal(a('Learning.record(181).seen'),same+2);
// Importação reúne históricos, é idempotente e rejeita dados inválidos antes de escrever.
run('Learning.sync();const backup=Learning.backup(),beforeImport=JSON.stringify(Learning.export());Learning.merge(backup);Learning.merge(backup)');
assert.equal(run('JSON.stringify(Learning.export())'),run('beforeImport'));
assert.throws(()=>run("Learning.merge({format:'parasitotrilha-aprendizado-v2',events:[{type:'rate',uid:'ausente'}]})"));assert.equal(run('JSON.stringify(Learning.export())'),run('beforeImport'));
// Todas as perguntas e identidades existem; cartas diferentes não reutilizam a chave.
assert.equal(run('new Set(CARDS.map(c=>c.uid)).size'),run('CARDS.length'));
assert(run("CARDS.filter(c=>c.kind!=='parasite').every(c=>recallPrompt(c)&&recallRubric(c).length===3)"));assert.equal(run('CASES.length'),21);assert.equal(run('MICROGRAPHS.length'),7);
console.log('OK: regressões de seleção, arrasto, pontuação assistida, 21 casos, 7 imagens, memória, importação idempotente e concorrência entre abas.');
// Rascunhos persistem em localStorage e abrir outro exercício não substitui o anterior.
run("startRecall(4,{ids:[33,34]});recallSession.notes='O cisto resiste no ambiente.';saveExercise('recall',recallSession);const savedRecallId=recallSession._draftId;startCycle(7);cyclePick(0);const savedCycleId=cycleSession._draftId");
assert(run('Recovery.drafts().some(d=>d.id===savedRecallId)'));assert(run('Recovery.drafts().some(d=>d.id===savedCycleId)'));
const reopened={...ctx,document:{...ctx.document,modelContext:null}};vm.createContext(reopened);
for(const f of ['cards','curriculum','knowledge','associations','engine','learning','game','study','recovery','tools','microscopy'])vm.runInContext(fs.readFileSync(`dist/${f}.js`,'utf8'),reopened);
assert(vm.runInContext("Recovery.drafts().some(d=>d.data.notes==='O cisto resiste no ambiente.')",reopened));
run('const resumed=Recovery.resumeDraft(savedRecallId)');assert.equal(run('resumed.data.notes'),'O cisto resiste no ambiente.');assert(run('resumed.data._draftId!==savedRecallId'));assert(run('Recovery.drafts().some(d=>d.id===savedCycleId)'));
// Backup completo inclui mesas, favorito e rascunho; importar novamente não duplica nada.
run("localStorage.setItem('parasitotrilha-favorito:giardia:stage','1');const fullBackup=Recovery.fullBackup(),currentBoard=JSON.stringify(state)");
assert(run('Recovery.validateBackup(fullBackup)===\'full\''));assert(run("fullBackup.favorites.includes('giardia:stage')"));assert(run('fullBackup.rounds.some(s=>JSON.stringify(s)===currentBoard)'));assert(run("fullBackup.drafts.some(d=>d.data?.notes==='O cisto resiste no ambiente.')"));
run('Recovery.importBackup(fullBackup);const afterFirstBackup=localStorage.length;Recovery.importBackup(fullBackup)');assert.equal(run('localStorage.length'),run('afterFirstBackup'));assert.equal(run('JSON.stringify(state)'),run('currentBoard'));
// Falhas de validação não escrevem nem eventos válidos presentes antes da parte inválida.
const beforeInvalid=JSON.stringify([...memory]);
assert.throws(()=>run("Recovery.importBackup({...fullBackup,favorites:['__proto__']})"));
assert.throws(()=>run("Recovery.importBackup({...fullBackup,rounds:[{...state,deck:'__proto__'}]})"));
assert.throws(()=>run("Recovery.importBackup({...fullBackup,drafts:[{version:3,id:'x',updatedAt:1,complete:false,type:'case',data:{index:0,checked:false,bank:[1],expected:[1],placed:[null,null,null]}}]})"));
assert.throws(()=>run("Recovery.importBackup({format:'parasitotrilha-aprendizado-v2',events:[{eventId:'e',at:1,type:'expose',uid:'__proto__',correct:true}]})"));
assert.equal(JSON.stringify([...memory]),beforeInvalid);
// Falha na segunda gravação desfaz a primeira, sem modificar estado e histórico.
run("const rollbackBackup={...fullBackup,rounds:[],drafts:[],favorites:[],learning:{...fullBackup.learning,events:[{eventId:'quota-teste-1',at:1,type:'expose',uid:'giardia:stage',correct:true},{eventId:'quota-teste-2',at:2,type:'expose',uid:'giardia:symptom',correct:true}]}}");
const originalSet=ctx.localStorage.setItem;let attempts=0;ctx.localStorage.setItem=(k,v)=>{if(++attempts===2)throw Error('quota');return originalSet(k,v);};
assert.throws(()=>run('Recovery.importBackup(rollbackBackup)'),/Nenhum dado/);ctx.localStorage.setItem=originalSet;
assert(!memory.has('parasitotrilha-evento-v2:quota-teste-1'));assert(!memory.has('parasitotrilha-evento-v2:quota-teste-2'));
assert.equal(run('JSON.stringify(state)'),run('currentBoard'));
// Um rascunho alterado localmente não é apagado por um backup antigo da mesma identidade.
run("startRecall(4,{ids:[33]});recallSession.notes='versão antiga';saveExercise('recall',recallSession);const oldDraftBackup=Recovery.fullBackup();recallSession.notes='versão recente';saveExercise('recall',recallSession);Recovery.importBackup(oldDraftBackup)");
assert(run("Recovery.drafts().some(d=>d.data.notes==='versão antiga')"));assert(run("Recovery.drafts().some(d=>d.data.notes==='versão recente')"));
run('const countBeforeRepeat=Recovery.drafts().length;Recovery.importBackup(oldDraftBackup)');assert.equal(run('Recovery.drafts().length'),run('countBeforeRepeat'));
console.log('OK: múltiplos rascunhos após reabrir, backup completo, compatibilidade, conflitos preservados, validação e rollback de importação.');
// Cada vínculo cadastrado funciona em uma mesa válida, com recompensa única e destino canônico.
let sharedCount=0;
for(const card of run('CARDS'))for(let target=0;target<20;target++){
 const accepted=run(`acceptsAssociation(${card.id},${target})`);
 assert.equal(accepted,card.family===target||card.related.includes(target));
 if(!accepted||card.family===target)continue;
 run(`state=newState();state.board.families=[${card.family},${target},...FAMILIES.map((_,i)=>i).filter(i=>i!==${card.family}&&i!==${target}).slice(0,2)];state.board.deckIds=CARDS.filter(c=>state.board.families.includes(c.family)).map(c=>c.id);state.board.columns=[[],[],[],[]];state.board.foundations=state.board.families.map(f=>[Solitaire.anchor(f)]);state.board.stock=state.board.deckIds.filter(id=>CARDS[id].kind!=='parasite'&&id!==${card.id});state.board.waste=[${card.id}];save();selected={zone:'waste'};destination({zone:'foundation',pile:1});`);
 assert(run('validState(state)'));assert.equal(run('state.coins'),120);assert(run(`state.board.foundations[0].includes(${card.id})`));
 assert(run(`associationExplanation(${card.id},${target}).sources.length>=2`));
 run(`undo();selected={zone:'waste'};destination({zone:'foundation',pile:1})`);assert.equal(run('state.coins'),120);sharedCount++;
}
assert(!run('acceptsAssociation(1,19)'));assert(!run('acceptsAssociation(9999,0)'));
console.log(`OK: 4.000 pares carta/coleção auditados contra o cadastro; ${sharedCount} vínculos compartilhados movem sem perder cartas nem repetir recompensa.`);
