/* Ferramentas de estudo, navegação e recuperação. Todo conteúdo importado é validado. */
function esc(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function branchHTML(f){return CYCLE_BRANCHES[f]?`<section class="cycle-branches"><h4>Caminhos que se separam</h4>${CYCLE_BRANCHES[f].map(([title,path])=>`<details><summary>${title}</summary><p>${path}</p></details>`).join('')}</section>`:'';}
function saveExercise(type,data){try{Recovery.saveDraft(type,data);}catch{if($('save-status'))$('save-status').textContent='Não foi possível guardar o exercício; mantenha esta aba aberta.';}}
function clearExercise(){try{Recovery.finishDraft();}catch{if($('save-status'))$('save-status').textContent='O resultado foi registrado, mas não foi possível encerrar o rascunho guardado.';}}
function readExercise(){try{return Recovery.drafts()[0]||null;}catch{return null;}}
function draftTitle(d){return d.type==='recall'?`Memória · ${d.data.index+1}/${d.data.queue.length} · ${d.data.family===null?'Coleções mistas':FAMILIES[d.data.family].short}`:d.type==='cycle'?`Ciclo · ${FAMILIES[d.data.family].short}`:`Caso · ${CASES[d.data.index].title}`;}
function openDraft(id){
 try{const r=Recovery.resumeDraft(id);if(!r){message('Este exercício já foi concluído em outra aba.');return;}if(r.type==='recall'){recallSession=r.data;renderRecall();}if(r.type==='cycle'){cycleSession=r.data;renderCycle();}if(r.type==='case'){caseSession=r.data;renderCase();}}
 catch{modal('Não foi possível retomar', '<p>Não foi possível guardar uma cópia do exercício. Baixe um backup e libere espaço no navegador antes de tentar novamente.</p>');}
}
function resumeExercise(){
 const drafts=Recovery.drafts();if(!drafts.length)return;if(drafts.length===1){openDraft(drafts[0].id);return;}
 modal('Exercícios guardados',`<p>Você pode fechar a aba e continuar depois neste navegador. Cada exercício tem seu próprio rascunho.</p><div class="deck-options">${drafts.map(d=>`<button class="deck-option" data-resume-draft="${d.id}"><strong>${esc(draftTitle(d))}</strong><span>Guardado em ${new Date(d.updatedAt).toLocaleString('pt-BR')}</span></button>`).join('')}</div>`);
 document.querySelectorAll('[data-resume-draft]').forEach(el=>el.onclick=()=>openDraft(el.dataset.resumeDraft));
}
function configureReview(){
 modal('Sua sessão de memória',`<div class="session-options"><label>Coleção<select id="session-family"><option value="all">Misturar coleções</option>${FAMILIES.map((f,i)=>`<option value="${i}">${f.name}</option>`).join('')}</select></label><label>Quantidade<select id="session-size"><option value="5">5 conceitos · sessão curta</option><option value="10" selected>10 conceitos</option><option value="20">20 conceitos</option></select></label><label>Conceito<select id="session-kind"><option value="all">Todos os tipos</option>${Object.entries(KINDS).filter(([k])=>k!=='parasite').map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}</select></label><label>Objetivo<select id="session-mode"><option value="scheduled">Pendentes e novos</option><option value="free">Praticar também os já revisados</option></select></label></div><p>Erros e respostas parciais retornam uma vez durante a sessão, após outras cartas quando houver. Revisões antecipadas não aumentam o nível.</p><button class="primary" id="begin-session">Começar sessão</button>`);
 $('begin-session').onclick=()=>startRecall($('session-family').value==='all'?null:+$('session-family').value,{limit:+$('session-size').value,kind:$('session-kind').value,mode:$('session-mode').value});
}
function renderGlossary(){
 $('study-tab-content').innerHTML=`<h3>Palavras que conectam o ciclo</h3><div class="glossary">${Object.entries(GLOSSARY).map(([term,def])=>`<details><summary>${term}</summary><p>${def}</p></details>`).join('')}</div><p class="muted">A forma infectante e o hospedeiro precisam ser descritos juntos: o gametócito infecta o mosquito; o esporozoíto inicia a infecção humana.</p>`;
}
let progressFilter='all';
function progressScreen(){
 const families=FAMILIES.map((f,i)=>({f,i,s:Learning.summary(i)})).filter(({s})=>progressFilter==='all'||progressFilter==='due'&&s.due||progressFilter==='new'&&!s.seen||progressFilter==='started'&&s.seen);
 $('study-tab-content').innerHTML=`<div class="progress-intro"><h3>Acompanhe cada objetivo.</h3><p>Revisão pendente e nível alcançado são medidas diferentes. O nível não desaparece no dia da próxima revisão. Um esquecimento registrado reduz o nível.</p></div><div class="progress-tools"><label>Mostrar coleções<select id="progress-filter"><option value="all">Todas</option><option value="due">Com revisões pendentes</option><option value="started">Já iniciadas</option><option value="new">Ainda não estudadas</option></select></label><button class="secondary" id="export-progress">Baixar backup</button><label class="file-button">Importar backup<input id="import-progress" type="file" accept="application/json,.json"></label><button class="secondary" id="saved-rounds">Partidas guardadas</button></div><p id="backup-result" role="status"></p><div class="curriculum-grid">${families.map(({f,i,s})=>{
 const r=Learning.cycleRecord(i);return `<article><span class="type-badge">${f.group}</span><h3>${f.disease}</h3><p>${f.name}</p><div class="coverage"><span style="width:${s.seen/s.total*100}%"></span></div><p><b>${s.seen}/${s.total}</b> praticados · <b>${s.retained}</b> no nível 3 ou maior · <b>${s.due}</b> pendentes</p><details class="objective-list"><summary>Ver objetivos e dificuldades</summary>${CARDS.filter(c=>c.family===i&&c.kind!=='parasite').map(c=>`<button data-study-card="${c.id}"><span>${KINDS[c.kind].label}</span><small>${STATUS_LABELS[Learning.status(c.id)]} · nível ${Learning.record(c.id)?.level||0}</small></button>`).join('')}<p>Ciclo montado: ${r.correct}/${r.attempts} tentativas corretas.</p></details><button class="secondary" data-progress-family="${i}">${s.due?'Revisar pendências':'Praticar coleção'} →</button></article>`;
 }).join('')||'<p>Nenhuma coleção corresponde a este filtro.</p>'}</div><details class="coverage-note"><summary>O que este currículo cobre e o que falta</summary><p>Estas 20 coleções trabalham forma, transmissão, localização, manifestação, diagnóstico, prevenção, hospedeiros, ciclo e distinções. Ascaris, esquistossomos, oxiúros, Trichuris, protozoários intestinais, cestódeos e infecções vetoriais estão representados.</p><p>Microscopia tem uma seleção inicial de imagens. Tratamento, posologia, todas as espécies e toda a epidemiologia não estão cobertos. Toxocaríase, larva migrans cutânea, tricomoníase, ciclosporíase, cistoisosporíase, fasciolose e ectoparasitoses ainda não têm coleções.</p><p>Use os objetivos para comparar com sua disciplina. Nível de memória é autoavaliado; os casos e a montagem dos ciclos registram desempenho objetivo. Ainda não houve validação de eficácia com estudantes.</p></details>`;
 $('progress-filter').value=progressFilter;$('progress-filter').onchange=e=>{progressFilter=e.target.value;progressScreen();};
 document.querySelectorAll('[data-progress-family]').forEach(el=>el.onclick=()=>startRecall(+el.dataset.progressFamily,{mode:'free'}));
 document.querySelectorAll('[data-study-card]').forEach(el=>el.onclick=()=>startRecall(CARDS[+el.dataset.studyCard].family,{ids:[+el.dataset.studyCard]}));
 $('export-progress').onclick=exportProgress;$('import-progress').onchange=importProgress;$('saved-rounds').onclick=savedRounds;
}
function exportProgress(){
 try{
  Learning.sync();const blob=new Blob([JSON.stringify(Recovery.fullBackup(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='parasitotrilha-completo-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  $('backup-result').textContent='Backup completo gerado: aprendizagem, mesa atual, partidas guardadas, favoritos e exercícios com rascunhos.';
 }catch{$('backup-result').textContent='Não foi possível gerar o backup. Seu histórico atual foi mantido.';}
}
async function importProgress(e){
 const file=e.target.files?.[0];if(!file)return;
 try{if(file.size>20000000)throw Error('Use um arquivo de até 20 MB.');const data=JSON.parse(await file.text()),result=Recovery.importBackup(data);refreshLearningUI();progressScreen();$('backup-result').textContent=result.kind==='legacy'?'Histórico de aprendizagem importado do backup antigo. A mesa atual foi preservada.':`Backup reunido: ${result.addedRounds} partidas, ${result.addedDrafts} exercícios e ${result.addedFavorites} favoritos adicionados. A mesa aberta foi preservada; retome as importadas em Partidas guardadas.`;}
 catch(err){$('backup-result').textContent=err instanceof SyntaxError?'Arquivo JSON inválido. O histórico atual foi mantido.':err.message;}
}
function savedRounds(){
 const rounds=[];try{for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith('parasitotrilha-partida-')){try{const s=JSON.parse(localStorage.getItem(key));if(validState(s))rounds.push({key,s});}catch{}}}}catch{}
 rounds.sort((a,b)=>String(b.s.roundId||b.key).localeCompare(String(a.s.roundId||a.key)));
 modal('Partidas guardadas',`<p>Ao trocar de baralho, a mesa anterior fica guardada neste navegador. Retomar preserva seu estudo.</p><div class="deck-options">${rounds.slice(0,30).map(({key,s},i)=>`<button class="deck-option" data-resume-round="${i}"><strong>${DECKS[s.deck].title}</strong><span>${s.coins} moedas · ${s.board.foundations.reduce((n,p)=>n+p.length-1,0)}/${s.board.deckIds.length-4} cartas</span></button>`).join('')||'<p>Você ainda não trocou de partida. A mesa atual continua salva.</p>'}</div>`);
 document.querySelectorAll('[data-resume-round]').forEach(el=>el.onclick=()=>{if(!syncBoard())return;archiveRound();state=clone(rounds[+el.dataset.resumeRound].s);state.independent||=[];selected=null;state.feedback=null;save();$('modal').close();setView('board');checkEnd();});
}
function writeStudyRoute(){
 if(activeView==='study'&&window.history&&window.location){const hash=`#study/${studyTab}/${studyTab==='compare'?comparisonIndex:atlasFamily}`;window.history.replaceState(null,'',hash);}
}
function restoreRoute(){
 const [view,tabName,value]=window.location.hash.slice(1).split('/');
 if(view==='study'){
  if(['atlas','compare','cases','progress','glossary','microscopy'].includes(tabName))studyTab=tabName;
  if(/^\d+$/.test(value||'')){if(studyTab==='compare'&&COMPARISONS[+value])comparisonIndex=+value;else if(FAMILIES[+value])atlasFamily=+value;}
 }
 if(['board','study','library'].includes(view))setView(view);
}
window.addEventListener('hashchange',restoreRoute);
window.addEventListener('storage',e=>{
 if(e.key?.startsWith('parasitotrilha-evento-v2:')){Learning.sync();refreshLearningUI();if(activeView==='study'&&studyTab==='progress'&&!$('modal').open)progressScreen();}
 if(e.key?.startsWith('parasitotrilha-rascunho-v3:'))refreshLearningUI();
 if(e.key===STORAGE)syncBoard();
});
// Restauration executes after all study modules are loaded.
document.addEventListener('DOMContentLoaded',()=>{if(window.location)restoreRoute();});
