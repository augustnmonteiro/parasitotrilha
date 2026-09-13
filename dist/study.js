let studyTab='atlas', atlasFamily=0, comparisonIndex=0, recallSession=null, cycleSession=null, caseSession=null;
const STATUS_LABELS={new:'Não estudada',due:'Revisar agora',learning:'Em consolidação',retained:'Lembrada em dias distintos'};
const concept=(f,kind)=>CARDS.find(c=>c.family===f&&c.kind===kind);
const formCard=f=>concept(f,'egg')||concept(f,'stage');
function refreshLearningUI() {
  const s=Learning.summary();
  $('due-count').textContent=s.due;
  $('learning-summary').textContent=`${s.seen} de ${s.total} conceitos praticados · ${s.retained} consolidados pela revisão`;
  $('review-count').textContent=s.due;
  if($('study-seen'))$('study-seen').textContent=s.seen;
  if($('study-due'))$('study-due').textContent=s.due;
  if($('study-retained'))$('study-retained').textContent=s.retained;
  if($('study-recall'))$('study-recall').textContent='Revisar e aprender →';
  if($('resume-exercise')&&typeof readExercise==='function')$('resume-exercise').hidden=!readExercise();
  if(!Learning.storageOK()) $('save-status').textContent='Estudo disponível apenas nesta sessão; armazenamento indisponível';
}
function openAtlas(f) {
  atlasFamily=f;studyTab='atlas';$('modal').close();setView('study');
}
function renderStudy() {
  const s=Learning.summary();
  $('study-view').innerHTML=`<div class="study-heading"><div><p class="eyebrow">DA ASSOCIAÇÃO À RECORDAÇÃO</p><h2>Entenda o caminho. Lembre a conexão.</h2><p>Jogue para reconhecer, reconstrua os ciclos e revise sem olhar a resposta.</p></div><div><button class="primary" id="study-recall">${s.due?`Revisar ${Math.min(10,s.due)} cartas pendentes`:'Iniciar revisão'} →</button><button class="secondary" id="configure-review">Personalizar sessão</button><button class="secondary" id="resume-exercise" hidden>Exercícios guardados</button></div></div>
  <div class="study-stats"><div><strong><b id="study-seen">${s.seen}</b><small> / ${s.total}</small></strong><span>conceitos praticados</span></div><div><strong id="study-due">${s.due}</strong><span>para revisar agora</span></div><div><strong id="study-retained">${s.retained}</strong><span>consolidados na revisão</span></div><p>“Consolidado” significa lembrar em pelo menos 3 revisões espaçadas, com autoavaliação. Uma partida completa não comprova domínio.</p></div>
  <div class="study-tabs" role="tablist" aria-label="Ferramentas de estudo">${[['atlas','Ciclos e relações'],['compare','Não confunda'],['cases','Casos com cartas'],['progress','Meu progresso'],['glossary','Glossário'],['microscopy','Microscopia']].map(([key,title])=>`<button role="tab" id="study-tab-${key}" tabindex="${key===studyTab?0:-1}" aria-selected="${key===studyTab}" aria-controls="study-tab-content" data-study-tab="${key}" class="${key===studyTab?'active':''}">${title}</button>`).join('')}</div><div id="study-tab-content" role="tabpanel" aria-labelledby="study-tab-${studyTab}"></div>`;
  $('study-recall').onclick=()=>startRecall();
  $('configure-review').onclick=configureReview;
  $('resume-exercise').hidden=!readExercise();$('resume-exercise').onclick=resumeExercise;
  document.querySelectorAll('[data-study-tab]').forEach(el=>el.onclick=()=>{studyTab=el.dataset.studyTab;renderStudy();document.querySelector(`[data-study-tab="${studyTab}"]`)?.focus();});
  document.querySelectorAll('[data-study-tab]').forEach(el=>el.onkeydown=e=>{
    const keys=['atlas','compare','cases','progress','glossary','microscopy'],i=keys.indexOf(studyTab);
    const next=e.key==='ArrowRight'?(i+1)%keys.length:e.key==='ArrowLeft'?(i+keys.length-1)%keys.length:e.key==='Home'?0:e.key==='End'?keys.length-1:null;
    if(next!==null){e.preventDefault();studyTab=keys[next];renderStudy();document.querySelector(`[data-study-tab="${studyTab}"]`)?.focus();}
  });
  if(studyTab==='atlas') renderAtlas();
  if(studyTab==='compare') renderComparison();
  if(studyTab==='progress') renderProgress();
  if(studyTab==='cases') renderCases();
  if(studyTab==='glossary')renderGlossary();
  if(studyTab==='microscopy')renderMicroscopy();
  refreshLearningUI();
  writeStudyRoute();
}
function renderAtlas() {
  const f=FAMILIES[atlasFamily], cards=CARDS.filter(c=>c.family===atlasFamily&&c.kind!=='parasite');
  $('study-tab-content').innerHTML=`<div class="atlas-controls"><label>Escolha uma coleção<select id="atlas-family">${FAMILIES.map((x,i)=>`<option value="${i}" ${i===atlasFamily?'selected':''}>${x.disease} · ${x.short}</option>`).join('')}</select></label><button class="secondary" id="practice-cycle">↻ Montar este ciclo</button><button class="secondary" id="recall-family">Lembrar sem pistas →</button></div>
  <article class="atlas"><div class="atlas-title"><div><span class="type-badge">${f.group}</span><h3>${f.name}</h3><p>${f.disease}</p></div><span class="atlas-number">${String(atlasFamily+1).padStart(2,'0')}<small> / 20</small></span></div>
  <h4>Trajeto principal</h4><ol class="cycle-map">${CYCLES[atlasFamily].map((step,i)=>`<li><span>${i+1}</span><p>${step}</p></li>`).join('')}</ol>
  <p class="muted">${CYCLE_NOTES[atlasFamily]||'A sequência mostra o trajeto principal. Consulte as cartas para as distinções de forma, local e transmissão.'}</p>
  ${branchHTML(atlasFamily)}<div class="causal-link"><span>POR QUE AS INFORMAÇÕES SE CONECTAM</span><p>${RELATIONS[atlasFamily]}</p></div>
  ${CLINICAL_CONTEXT[atlasFamily]?`<aside class="clinical-context"><h4>Quando o contexto muda a interpretação</h4><p>${CLINICAL_CONTEXT[atlasFamily]}</p>${sourceLink(atlasFamily===7?concept(7,'pitfall'):concept(atlasFamily,'diagnosis'))}</aside>`:''}<div class="atlas-facts">${cards.map(c=>`<article><span class="type-badge kind-${c.kind}">${KINDS[c.kind].symbol} ${KINDS[c.kind].label}</span><h4>${c.title}</h4><p>${c.description}</p><details><summary>Entender e consultar a fonte</summary><p>${c.explanation}</p>${sourceLink(c)}</details></article>`).join('')}</div></article>`;
  $('atlas-family').onchange=e=>{atlasFamily=+e.target.value;renderAtlas();writeStudyRoute();};
  $('practice-cycle').onclick=()=>startCycle(atlasFamily);
  $('recall-family').onclick=()=>startRecall(atlasFamily);
}
function renderComparison() {
  const item=COMPARISONS[comparisonIndex];
  const rows=[['Forma característica',f=>formCard(f)],['Entrada no humano',f=>concept(f,'transmission')],['Localização',f=>concept(f,'habitat')],['Manifestação',f=>concept(f,'symptom')],['Diagnóstico',f=>concept(f,'diagnosis')],['Hospedeiro e vetor',f=>concept(f,'host')],['Distinção importante',f=>concept(f,'pitfall')]];
  $('study-tab-content').innerHTML=`<div class="comparison-picker">${COMPARISONS.map((c,i)=>`<button data-compare="${i}" aria-pressed="${i===comparisonIndex}" class="${i===comparisonIndex?'active':''}">${c.title}</button>`).join('')}</div><div class="causal-link"><span>${item.title}</span><p>${item.key}</p></div><div class="comparison-table" tabindex="0" role="region" aria-label="Comparação de parasitos; role horizontalmente em telas pequenas"><table><caption>Leia cada linha entre as coleções; depois tente explicá-la sem consultar.</caption><thead><tr><th scope="col">Conceito</th>${item.families.map(f=>`<th scope="col">${FAMILIES[f].name}<small>${FAMILIES[f].disease}</small></th>`).join('')}</tr></thead><tbody>${rows.map(([label,find])=>`<tr><th scope="row">${label}</th>${item.families.map(f=>{const c=find(f);return `<td data-label="${FAMILIES[f].short}"><b>${c.title}</b><p>${c.description}</p></td>`;}).join('')}</tr>`).join('')}</tbody></table></div><p class="muted">Características compartilhadas não são exclusivas. Use a combinação de exposição, fase e amostra.</p><div class="comparison-links">${item.families.map(f=>`<button class="secondary" data-atlas="${f}">Ciclo de ${FAMILIES[f].short} ↗</button>`).join('')}</div>`;
  document.querySelectorAll('[data-compare]').forEach(el=>el.onclick=()=>{comparisonIndex=+el.dataset.compare;renderComparison();writeStudyRoute();document.querySelector(`[data-compare="${comparisonIndex}"]`)?.focus();});
  document.querySelectorAll('[data-atlas]').forEach(el=>el.onclick=()=>openAtlas(+el.dataset.atlas));
}
function renderProgress(){progressScreen();}
function startRecall(family=null,options={}) {
  selected=null;render();
  const queue=options.ids||Learning.queue(family,Date.now(),options.limit||10,options.mode||'scheduled',options.kind||'all');
  recallSession={queue,index:0,revealed:false,results:[],family,retried:[],notes:'',originalCount:queue.length};
  if(!queue.length) {
    const upcoming=CARDS.filter(c=>c.kind!=='parasite'&&(family===null||c.family===family)).map(c=>Learning.record(c.id)?.due).filter(Boolean).sort((a,b)=>a-b)[0];
    modal('Revisão em dia.',`<p>Não há cartas novas ou pendentes ${family===null?'neste momento':'nesta coleção'}. ${upcoming?`Próxima revisão: <b>${new Date(upcoming).toLocaleDateString('pt-BR')}</b>.`:''}</p><p>Você pode praticar antecipadamente; isso não promove o nível antes do dia programado.</p><button class="secondary" id="free-practice">Praticar mesmo assim</button><button class="primary" id="recall-done">Voltar ao estudo →</button>`);
    $('free-practice').onclick=()=>startRecall(family,{mode:'free'});$('recall-done').onclick=()=>{$('modal').close();setView('study');};return;
  }
  renderRecall();
}
function renderRecall() {
  const r=recallSession;
  if(r.index>=r.queue.length) {
    Learning.finish();clearExercise();refreshLearningUI();
    const first=r.results.filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i),good=first.filter(x=>x.grade==='good').length;
    modal('Sessão de memória concluída.',`<div class="recall-summary"><strong>${good}<small> / ${first.length}</small></strong><p>respostas que você lembrou sem ajuda</p></div><p>Seu histórico foi atualizado. As cartas difíceis foram retomadas nesta sessão e voltam amanhã; as lembradas seguem seus intervalos.</p><p class="muted">Acertos aqui são autoavaliados. Compare sua resposta com todos os pontos antes de marcar que lembrou.</p><button class="primary" id="recall-done">Ver meu progresso →</button>`);
    $('recall-done').onclick=()=>{$('modal').close();studyTab='progress';setView('study');};return;
  }
  saveExercise('recall',r);
  const c=CARDS[r.queue[r.index]],f=FAMILIES[c.family];
  modal(`Memória · ${r.index+1} de ${r.queue.length}`,`<div class="recall-meta"><span class="type-badge kind-${c.kind}">${KINDS[c.kind].label}</span><span>GRÁTIS · SEM ALTERNATIVAS</span></div><h3>${f.name}</h3><p class="recall-prompt">${recallPrompt(c)}</p><label class="recall-input">Explique com suas palavras <span>(rascunho salvo neste navegador; compare ao revelar)</span><textarea id="recall-notes" maxlength="20000" rows="3" placeholder="Tente lembrar antes de revelar…"></textarea></label><button class="primary" id="reveal-recall">Revelar e comparar minha resposta ↓</button><div id="recall-answer" role="region" aria-label="Resposta e critérios de conferência" tabindex="-1" hidden></div>`);
  $('recall-notes').value=r.notes||'';$('recall-notes').oninput=e=>{r.notes=e.target.value;saveExercise('recall',r);};
  $('reveal-recall').onclick=revealRecall;
  if(r.revealed){r.revealed=false;revealRecall();return;}
  $('reveal-recall').focus({preventScroll:true});
}
function revealRecall() {
  const r=recallSession;if(!r||r.revealed||r.index>=r.queue.length)return;
  r.revealed=true;saveExercise('recall',r);const c=CARDS[r.queue[r.index]];
  $('reveal-recall').hidden=true;$('recall-answer').hidden=false;
  $('recall-answer').innerHTML=`<div class="recall-answer"><span class="type-badge">PONTOS PARA CONFERIR</span><ul class="recall-checklist">${recallRubric(c).map((point,i)=>`<li><label><input type="checkbox" data-rubric="${i}"> <span>${point}</span></label></li>`).join('')}</ul><p class="muted">Marque apenas os pontos presentes na sua resposta antes de revelar. Para “Lembrei e expliquei”, confira todos.</p><div class="learning-note">${RELATIONS[c.family]}</div>${sourceLink(c)}</div><p><b>Antes de ver a resposta, você conseguiu lembrar?</b></p><div class="rating-options"><button data-grade="again">Não lembrei<small>Retomar nesta sessão</small></button><button data-grade="hard">Lembrei em parte<small>Reforçar amanhã</small></button><button data-grade="good" disabled>Lembrei e expliquei<small>Manter o espaçamento</small></button></div>`;
  $('recall-answer').focus({preventScroll:false});
  document.querySelectorAll('[data-rubric]').forEach(el=>el.onchange=()=>{document.querySelector('[data-grade="good"]').disabled=![...document.querySelectorAll('[data-rubric]')].every(x=>x.checked);});
  document.querySelectorAll('[data-grade]').forEach(el=>el.onclick=()=>rateRecall(el.dataset.grade));
}
function rateRecall(grade) {
  const r=recallSession;if(!r||!r.revealed||r.index>=r.queue.length)return;
  const id=r.queue[r.index];Learning.rate(id,grade);
  r.results.push({id,grade});
  if(grade!=='good'&&!r.retried.includes(id)){r.queue.splice(Math.min(r.queue.length,r.index+3),0,id);r.retried.push(id);}
  r.index++;r.revealed=false;r.notes='';saveExercise('recall',r);refreshLearningUI();renderRecall();
}
function startCycle(f) {
  let bank=Solitaire.shuffle(CYCLES[f].map((_,i)=>i));
  if(bank.every((x,i)=>x===i)) bank=bank.slice(1).concat(bank[0]);
  cycleSession={family:f,bank,order:[],checked:false};renderCycle();
}
function renderCycle() {
  const s=cycleSession,steps=CYCLES[s.family];saveExercise('cycle',s);
  modal(`Reconstrua · ${FAMILIES[s.family].short}`,`<p>Comece em <b>${steps[0]}</b>. Toque nas cartas para montar a sequência. A primeira etapa é a referência; pense nas relações entre as demais.</p><ol class="cycle-slots">${steps.map((_,i)=>`<li>${s.order[i]===undefined?`<span>${i+1}</span> Próxima etapa…`:`<button data-cycle-remove="${i}"><span>${i+1}</span>${steps[s.order[i]]}<small>Remover ×</small></button>`}</li>`).join('')}</ol><div class="cycle-bank">${s.bank.filter(i=>!s.order.includes(i)).map(i=>`<button data-cycle-step="${i}">${steps[i]} <span>+</span></button>`).join('')}</div><button class="primary" id="verify-cycle" ${s.order.length!==steps.length?'disabled':''}>Conferir sequência</button><div id="cycle-result" role="status"></div><p class="muted">Treino gratuito. As etapas resumem o trajeto principal; ramificações aparecem no mapa.</p>`);
  document.querySelectorAll('[data-cycle-step]').forEach(el=>el.onclick=()=>cyclePick(+el.dataset.cycleStep));
  document.querySelectorAll('[data-cycle-remove]').forEach(el=>el.onclick=()=>{if(!s.checked){s.order.splice(+el.dataset.cycleRemove,1);renderCycle();}});
  $('verify-cycle').onclick=checkCycle;
}
function cyclePick(i) {const s=cycleSession;if(!s||s.checked||!s.bank.includes(i)||s.order.includes(i))return;s.order.push(i);renderCycle();(document.querySelector('[data-cycle-step]')||$('verify-cycle')).focus({preventScroll:true});}
function checkCycle() {
  const s=cycleSession;if(!s||s.checked||s.order.length!==CYCLES[s.family].length)return;
  s.checked=true;clearExercise();const correct=s.order.every((v,i)=>v===i);Learning.cycle(s.family,correct);
  Learning.expose(concept(s.family,'cycle').id,correct);refreshLearningUI();
  $('verify-cycle').disabled=true;
  document.querySelectorAll('[data-cycle-remove]').forEach(el=>el.disabled=true);
  $('cycle-result').innerHTML=`<div class="review-result"><b>${correct?'Caminho reconstruído!':'Confira onde o caminho mudou.'}</b><p>${RELATIONS[s.family]}</p>${correct?'':`<p><b>Relações a ajustar:</b></p><ul>${s.order.slice(0,-1).flatMap((step,i)=>s.order[i+1]===step+1?[]:[`<li>Você ligou “${CYCLES[s.family][step]}” a “${CYCLES[s.family][s.order[i+1]]}”. Neste trajeto, ${step===4?'a etapa final fecha o ciclo e volta à primeira':`a próxima etapa é “${CYCLES[s.family][step+1]}”`}.</li>`]).join('')}</ul><details><summary>Consultar o trajeto completo</summary><ol>${CYCLES[s.family].map(step=>`<li>${step}</li>`).join('')}</ol></details>`}<p>${CYCLE_NOTES[s.family]||FAMILY_NOTES[s.family]}</p>${sourceLink(concept(s.family,'cycle'))}<button class="secondary" id="cycle-again">${correct?'Voltar ao mapa':'Embaralhar e tentar de novo'}</button></div>`;
  $('cycle-again').onclick=()=>correct?openAtlas(s.family):startCycle(s.family);
}
const CASES=[
 {title:'A pista está fora do intestino',text:'Uma criança tem prurido perianal noturno. O exame de fezes não mostrou ovos. Relacione a hipótese, a morfologia e a coleta que faz sentido nesse ciclo.',family:2,others:[3,19]},
 {title:'Carne ou contaminação fecal?',text:'Uma pessoa apresenta crises epilépticas e neuroimagem com lesões císticas, uma delas com escólex. Há contato domiciliar com portador de tênia adulta. A pessoa não consome porco. Relacione agente, forma que inicia a infecção e investigação.',family:11,others:[10,18]},
 {title:'Diarreia após água não tratada',text:'Após consumir água não tratada, uma pessoa apresenta distensão, fezes gordurosas e perda de peso, sem disenteria. A pesquisa inicial foi negativa. Qual combinação de agente, forma e investigação explica melhor essas pistas?',family:4,others:[9,16]},
 {title:'Uma infecção que persiste',text:'Há história de exposição ao solo e episódios de lesão serpiginosa de progressão rápida. A investigação busca um nematódeo capaz de autoinfecção. Associe as cartas.',family:7,others:[8,0]},
 {title:'Recorrência sem nova picada',text:'Uma pessoa tem novo episódio de febre malárica meses depois, sem nova viagem. A avaliação aponta recaída de origem hepática; o esfregaço tem hemácias aumentadas e granulações. Relacione espécie, forma que persiste e investigação.',family:15,others:[6,12]},
 {title:'Perda de ferro e solo',text:'Uma pessoa com anemia apresenta ovos ovais de casca fina e embrião segmentado nas fezes. Considere vermes adultos hematófagos. Monte a associação completa.',family:8,others:[0,7]}
 ,{title:'Água doce e lesão hepática',text:'Após exposições repetidas a água doce, uma pessoa apresenta aumento do baço e fibrose periportal. A amostra fecal tem ovos com espinho lateral. Relacione o agente, o ovo e o método de investigação.',family:1,others:[0,18]},
 {title:'Tampões e doença colônica',text:'Uma criança com diarreia persistente e prolapso retal elimina ovos em formato de barril com tampões nas extremidades. Qual coleção conecta morfologia e doença do cólon?',family:3,others:[2,19]},
 {title:'O intestino obstruído',text:'Uma criança de área com saneamento precário apresenta obstrução intestinal por vermes cilíndricos grandes. Ovos férteis de casca espessa e superfície irregular aparecem nas fezes. Monte a relação.',family:0,others:[8,3]},
 {title:'Cisto, invasão e fígado',text:'Disenteria e uma lesão hepática levantam a hipótese de invasão a partir do cólon. A microscopia mostra amebas, mas não distingue as espécies semelhantes. Relacione a hipótese invasiva, a forma transmissível e o teste que esclarece.',family:9,others:[4,16]},
 {title:'Surtos depois da piscina',text:'Um surto de diarreia aquosa ocorre após uso de piscina. Nas fezes, há oocistos arredondados de 4–6 µm que exigem coloração específica. Conecte as cartas.',family:16,others:[4,9]},
 {title:'Segmentos nas fezes',text:'Após consumir carne bovina pouco cozida, uma pessoa elimina proglotes. A investigação é de um adulto intestinal. Associe o agente, a forma ingerida e a amostra diagnóstica.',family:10,others:[11,18]},
 {title:'Cão, vísceras e cisto',text:'Uma pessoa com exposição rural a cães apresenta cisto hepático com vesículas-filhas. O ciclo habitual inclui cães que ingerem vísceras cruas. Relacione agente, forma tecidual e investigação.',family:18,others:[11,9]},
 {title:'Um cestódeo sem intermediário obrigatório',text:'O exame fecal de uma criança mostra ovos com oncosfera e filamentos polares. A autoinfecção interna pode manter alta carga, mesmo sem ingerir carne. Conecte as três cartas.',family:19,others:[3,10]},
 {title:'Arritmia anos após a exposição',text:'Uma pessoa de área com triatomíneos desenvolve arritmia e dilatação do esôfago anos após a exposição. A fase crônica modifica a escolha do método. Associe agente, forma sanguínea e investigação.',family:12,others:[13,6]},
 {title:'Febre persistente e baço aumentado',text:'Febre prolongada, perda de peso e pancitopenia acompanham grande aumento do baço. Amastigotas são encontradas na medula óssea. Conecte o padrão visceral, a forma e a investigação.',family:13,others:[14,12]},
 {title:'Úlcera e risco mucoso',text:'Depois de exposição em mata, uma pessoa desenvolve úlcera indolor de bordas elevadas. A investigação de espécie importa pelo risco de lesões mucosas posteriores. Escolha a combinação mais compatível.',family:14,others:[13,12]},
 {title:'O sangue e o formato em crescente',text:'Um paciente febril apresenta parasitos intraeritrocitários e gametócitos em crescente. O quadro inclui disfunção orgânica. Relacione a espécie, a forma e a investigação no sangue.',family:6,others:[15,17]},
 {title:'Linfáticos e coleta noturna',text:'Linfedema e hidrocele levam à investigação de microfilárias. A coleta considera periodicidade noturna; as formas têm bainha e cauda sem núcleos até a ponta. Monte a associação.',family:17,others:[6,7]},
 {title:'Persistência e reativação no encéfalo',text:'Em imunossupressão, encefalite é associada à reativação de cistos com formas de multiplicação lenta. O ciclo sexuado do agente ocorre em felídeos. Relacione agente, forma persistente e investigação contextualizada.',family:5,others:[11,18]},
 {title:'O risco de acelerar um ciclo interno',text:'Uma pessoa com exposição antiga ao solo recebe corticoide e desenvolve quadro intestinal e pulmonar grave, com muitas larvas. A autoinfecção se amplificou. Relacione parasito, forma usual nas fezes e investigação.',family:7,others:[8,0]}

];
function renderCases() {
  $('study-tab-content').innerHTML=`<div class="progress-intro"><h3>Três cartas. Uma explicação clínica.</h3><p>Relacione parasito, forma e exame. São situações didáticas simplificadas para conectar os conceitos.</p></div><div class="case-grid">${CASES.map((c,i)=>`<button class="case-tile" data-case="${i}"><span>CASO ${String(i+1).padStart(2,'0')}</span><strong>${c.title}</strong><p>${c.text}</p><small>${Learning.caseRecord('caso-'+i).correct}/${Learning.caseRecord('caso-'+i).attempts} tentativas corretas</small><b>Montar as cartas →</b></button>`).join('')}</div>`;
  document.querySelectorAll('[data-case]').forEach(el=>el.onclick=()=>startCase(+el.dataset.case));
}
function startCase(index) {
  const c=CASES[index],families=[c.family,...c.others];
  const expected=[concept(c.family,'parasite').id,formCard(c.family).id,concept(c.family,'diagnosis').id];
  const bank=Solitaire.shuffle(families.flatMap(f=>[concept(f,'parasite').id,formCard(f).id,concept(f,'diagnosis').id]));
  caseSession={index,bank,expected,placed:[null,null,null],selected:null,checked:false};renderCase();
}
function renderCase() {
  const s=caseSession,c=CASES[s.index];saveExercise('case',s);
  modal(c.title,`<p>${c.text}</p><p class="muted">Selecione uma carta e toque no espaço correspondente. Tocar em um espaço preenchido sem seleção devolve a carta.</p><div class="case-slots">${['Parasito','Forma característica','Diagnóstico'].map((name,i)=>`<button data-case-slot="${i}" class="${s.placed[i]!==null?'filled':''}"><span>${name}</span><strong>${s.placed[i]===null?'Colocar carta +':clueCard(CARDS[s.placed[i]]).title}</strong></button>`).join('')}</div><div class="case-bank">${s.bank.filter(id=>!s.placed.includes(id)).map(id=>`<button data-case-card="${id}" aria-pressed="${s.selected===id}" class="kind-${CARDS[id].kind} ${s.selected===id?'active':''}"><span class="type-badge">${KINDS[CARDS[id].kind].label}</span><b>${clueCard(CARDS[id]).title}</b></button>`).join('')}</div><p id="case-message" role="status">${s.selected===null?'Escolha uma carta.':'Carta selecionada. Escolha um espaço acima.'}</p><button class="primary" id="verify-case" ${s.placed.includes(null)?'disabled':''}>Conferir as relações</button><div id="case-result" role="status"></div>`);
  document.querySelectorAll('[data-case-card]').forEach(el=>el.onclick=()=>{if(!s.checked){s.selected=s.selected===+el.dataset.caseCard?null:+el.dataset.caseCard;renderCase();document.querySelector(`[data-case-slot="${CARDS[s.selected]?.kind==='parasite'?0:CARDS[s.selected]?.kind==='diagnosis'?2:1}"]`)?.focus({preventScroll:true});}});
  document.querySelectorAll('[data-case-slot]').forEach(el=>el.onclick=()=>placeCase(+el.dataset.caseSlot));
  $('verify-case').onclick=checkCase;
}
function placeCase(slot) {
  const s=caseSession;if(!s||s.checked||!Number.isInteger(slot)||slot<0||slot>2)return;
  if(s.selected===null){s.placed[slot]=null;renderCase();return;}
  const kind=CARDS[s.selected].kind,expectedKind=CARDS[s.expected[slot]].kind;
  if(kind!==expectedKind && !(['egg','stage'].includes(kind)&&['egg','stage'].includes(expectedKind))) {$('case-message').textContent='Esse tipo de carta precisa de outro espaço. Não há penalidade.';return;}
  if(!s.bank.includes(s.selected)||s.placed.includes(s.selected))return;
  s.placed[slot]=s.selected;s.selected=null;renderCase();(s.placed.includes(null)?document.querySelector('[data-case-card]'):$('verify-case'))?.focus({preventScroll:true});
}
function checkCase() {
  const s=caseSession;if(!s||s.checked||s.placed.includes(null))return;
  s.checked=true;clearExercise();const c=CASES[s.index], matches=(id,i)=>id===s.expected[i] || i>0&&acceptsAssociation(id,c.family);
  const correct=s.placed.every(matches);
  Learning.caseResult('caso-'+s.index,c.family,CARDS[s.placed[0]].family,correct);
  if(!matches(s.placed[0],0))Learning.expose(concept(c.family,'pitfall').id,false);
  s.expected.slice(1).forEach((id,i)=>Learning.expose(id,!!matches(s.placed[i+1],i+1)));refreshLearningUI();
  $('verify-case').disabled=true;
  document.querySelectorAll('[data-case-card],[data-case-slot]').forEach(el=>el.disabled=true);
  $('case-result').innerHTML=`<div class="review-result"><b>${correct?'As três cartas se conectam.':'Vamos reconstruir o raciocínio.'}</b><ol>${s.expected.map((id,i)=>`<li>${matches(s.placed[i],i)?'✓':'↻'} <strong>${CARDS[id].title}</strong>${s.placed[i]!==id&&matches(s.placed[i],i)?'<p>A carta escolhida também é válida: essa característica é compartilhada.</p>':''}<p>${CARDS[id].explanation}</p>${!matches(s.placed[i],i)?`<p class="differential"><b>Sua escolha:</b> ${clueCard(CARDS[s.placed[i]]).title}. ${CARDS[s.placed[i]].explanation} Compare essa relação com a exposição, o local e a fase descritos no caso.</p>`:''}</li>`).join('')}</ol><p>${RELATIONS[c.family]}</p>${sourceLink(CARDS[s.expected[2]])}<button class="secondary" id="case-map">Entender o ciclo completo →</button></div>`;
  $('case-map').onclick=()=>openAtlas(c.family);
}
$('daily-review').onclick=()=>startRecall();
$('open-study').onclick=()=>setView('study');
// Importa exposição antiga uma única vez, sem declarar retenção.
for(const id of [...new Set([...state.mastered,...state.errors])]) if(!Learning.record(id)) Learning.expose(id,!state.errors.includes(id));
refreshLearningUI();
