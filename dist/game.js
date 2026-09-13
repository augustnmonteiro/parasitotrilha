const $ = id => document.getElementById(id);
const clone = x => JSON.parse(JSON.stringify(x));
const STORAGE = 'parasitotrilha-associacoes-v5';
const PREVIOUS_STORAGE = 'imunotrilha-associacoes-v4';
const LEGACY_STORAGE = 'imunotrilha-associacoes-v3';
function newState(deck = 'helmintos') {
  return {version: 5, deck, board: Solitaire.create(deck), coins: 100, attempts: 0, streak: 0, bestStreak: 0, mastered: [], errors: [], reviewed: [], hinted: [], history: [], feedback: null, roundId: 'r'+Date.now().toString(36)+Math.random().toString(36).slice(2), independent: []};
}
function validState(s) {
  return s?.version === 5 && Object.hasOwn(DECKS,s.deck) && Solitaire.valid(s.board)
    && ['coins', 'attempts', 'streak', 'bestStreak'].every(k => Number.isSafeInteger(s[k]) && s[k] >= 0)
    && ['mastered', 'errors', 'reviewed', 'hinted'].every(k => Array.isArray(s[k]) && new Set(s[k]).size === s[k].length && s[k].every(id => Number.isInteger(id) && s.board.deckIds.includes(id) && CARDS[id].kind !== 'parasite'))
    && (!s.independent || Array.isArray(s.independent)&&new Set(s.independent).size===s.independent.length&&s.independent.every(id=>s.mastered.includes(id)))
    && (!s.roundId || typeof s.roundId==='string'&&/^[a-zA-Z0-9-]{1,100}$/.test(s.roundId))
    && Array.isArray(s.history) && s.history.length <= 80 && s.history.every(b => Solitaire.valid(b) && b.deckIds.join() === s.board.deckIds.join() && b.families.join() === s.board.families.join())
    && (!s.feedback || Number.isInteger(s.feedback.id) && s.board.deckIds.includes(s.feedback.id) && ['correct', 'wrong', 'hint', 'shared'].includes(s.feedback.type) && Number.isFinite(s.feedback.delta)&& (s.feedback.sharedFamily==null||Number.isInteger(s.feedback.sharedFamily)&&!!FAMILIES[s.feedback.sharedFamily]));
}
function migrate(old) {
  if (![3,4].includes(old?.version)) return null;
  const s = clone(old);
  if (s.version === 3) {
    s.board = {...s.board, families:[0,1,2,3], deckIds:Array.from({length:24},(_,i)=>i)};
    s.deck='helmintos'; s.bestStreak=s.streak;
  }
  if (!Solitaire.valid(s.board)) return null;
  s.version=5; s.history=[]; s.feedback=null;
  // Conteúdo substituído volta ao monte; moedas e as outras associações permanecem.
  for (const pile of s.board.foundations) {
    const replaced=pile.filter(id=>CHANGED_CARD_IDS.includes(id));
    pile.splice(0,pile.length,...pile.filter(id=>!CHANGED_CARD_IDS.includes(id)));
    s.board.stock.push(...replaced);
  }
  for (const key of ['mastered','errors','reviewed','hinted']) s[key]=(s[key]||[]).filter(id=>!CHANGED_CARD_IDS.includes(id));
  return validState(s) ? s : null;
}
let state;
try {
  const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const saved=read(STORAGE);
  state = validState(saved) ? saved : migrate(read(PREVIOUS_STORAGE)) || migrate(read(LEGACY_STORAGE)) || newState();
} catch { state = newState(); }
state.independent ||= state.mastered.filter(id=>!state.errors.includes(id)&&!state.hinted.includes(id));
state.roundId ||= 'legado-'+Date.now().toString(36);
let selected = null, dragSource = null, lastSaved = null, activeView = 'board';
function syncBoard() {
  try {
    const raw=localStorage.getItem(STORAGE);
    if(lastSaved && raw && raw!==lastSaved) {
      const next=JSON.parse(raw);
      if(validState(next)) {state=next;state.independent ||= [];selected=null;dragSource=null;lastSaved=raw;render();message('A mesa foi atualizada em outra aba. Confira as cartas antes de jogar.');return false;}
    }
  } catch {}
  return true;
}
const total = () => state.board.deckIds.length - 4;
const completed = () => state.board.foundations.reduce((n, p) => n + p.length - 1, 0);
const ended = () => completed() === total() || state.coins === 0;
const blocked = () => ended() || ['wrong', 'hint', 'shared'].includes(state.feedback?.type);
const selectedIds = () => Solitaire.stack(state.board, selected);
const expectedCards = family => state.board.deckIds.filter(id => CARDS[id].family === family);
const sourceLink = c => `<a class="reference" href="${c.source}" target="_blank" rel="noopener noreferrer">${c.source.includes('cdc.gov') ? 'CDC · Referência da carta' : c.source.includes('gov.br') ? 'Ministério da Saúde · Referência' : 'Referência científica'} ↗</a>`;
function save() {
  try { lastSaved=JSON.stringify(state);localStorage.setItem(STORAGE,lastSaved); }
  catch { $('save-status').textContent = 'Progresso disponível apenas nesta sessão'; }
}
function message(text) { $('table-message').textContent = text; }
function remember() { state.history.push(clone(state.board)); if (state.history.length > 80) state.history.shift(); }
function stats() {
  $('coins').textContent = state.coins;
  $('accuracy').innerHTML = `${state.mastered.length} <span>${state.mastered.length === 1 ? 'associação' : 'associações'}</span>`;
  $('streak').innerHTML = `${state.streak} <span>${state.streak === 1 ? 'acerto' : 'acertos'}</span>`;
  const lit = state.streak ? ((state.streak - 1) % 3) + 1 : 0;
  $('streak-dots').innerHTML = Array.from({length: 3}, (_, i) => `<i class="${i < lit ? 'on' : ''}"></i>`).join('');
  $('progress-label').innerHTML = `${completed()} <span>/ ${total()} cartas</span>`;
  $('progress-fill').style.width = `${completed() / total() * 100}%`;
  $('progress-meter').setAttribute('aria-valuemax', total());
  $('progress-meter').setAttribute('aria-valuenow', completed());
  $('deck-name').textContent = DECKS[state.deck].title;
  $('round-size').textContent = `4 coleções · ${state.board.deckIds.length} cartas${state.board.deckIds.length!==40?' · partida anterior preservada':''}`;
  $('review-count').textContent = Learning.due().length;
  $('undo').disabled = !state.history.length || blocked();
  if(typeof refreshLearningUI==='function') refreshLearningUI();
}
function cardHTML(id, attrs = '', picked = false) {
  const c = clueCard(CARDS[id]), k = KINDS[c.kind];
  return `<button class="concept-card kind-${c.kind} ${picked ? 'picked' : ''}" ${attrs} aria-pressed="${picked}" aria-label="${k.label}: ${c.title}. ${c.description}"><span class="concept-category">${k.symbol} ${k.label}</span><strong class="concept-title">${c.title}</strong><span class="concept-description">${c.description}</span><span class="concept-footer">${state.mastered.includes(id) ? '✓ Associada nesta partida' : 'Toque para conectar ↗'}</span></button>`;
}
function render() {
  stats();
  const b = state.board;
  $('foundations').innerHTML = b.foundations.map((pile, p) => {
    const f = b.families[p], family = FAMILIES[f], expected = expectedCards(f).length;
    return `<div class="foundation ${selected ? 'receiving' : ''}" data-foundation="${p}"><button class="parasite-card" data-base="${p}" aria-label="${selected ? 'Associar a' : 'Ver coleção de'} ${family.name}"><span class="anchor-type">◎ Parasito</span><strong>${family.name}</strong><em>${family.disease}</em><span class="collection-progress"><span style="width:${(pile.length - 1) / (expected - 1) * 100}%"></span></span></button><button class="collection-link" data-collection="${p}" aria-label="Ver coleção de ${family.name}, ${pile.length - 1} de ${expected - 1} associações">${pile.length - 1} / ${expected - 1} conexões ${pile.length === expected ? '✓' : '↗'}</button></div>`;
  }).join('');
  document.querySelectorAll('[data-base]').forEach(el => el.onclick = () => selected ? destination({zone: 'foundation', pile: +el.dataset.base}) : collection(+el.dataset.base));
  document.querySelectorAll('[data-collection]').forEach(el => el.onclick = () => collection(+el.dataset.collection));
  document.querySelectorAll('[data-foundation]').forEach(el => bindDrop(el, {zone: 'foundation', pile: +el.dataset.foundation}));
  $('stock').innerHTML = `<button class="draw-button" id="draw" aria-label="${b.stock.length ? 'Comprar carta sem custo' : 'Reciclar descarte sem custo'}" ${blocked() || !b.stock.length && !b.waste.length ? 'disabled' : ''}>${b.stock.length ? '✳' : '↻'}</button>`;
  $('draw').onclick = draw;
  $('stock-count').textContent = `${b.stock.length} no monte · ${b.waste.length} no descarte`;
  if (b.waste.length) {
    const c = clueCard(CARDS[b.waste.at(-1)]), k = KINDS[c.kind];
    $('waste').innerHTML = `<button id="waste-card" class="waste-button kind-${c.kind} ${selected?.zone === 'waste' ? 'picked' : ''}" draggable="true" aria-pressed="${selected?.zone==='waste'}" aria-label="Descarte: ${c.title}"><span>${k.symbol} ${k.label}</span><strong>${c.title}</strong></button>`;
    $('waste-card').onclick = () => pick({zone: 'waste'});
    bindDrag($('waste-card'), {zone: 'waste'});
  } else $('waste').innerHTML = '<div class="waste-empty">Sua próxima carta aparece aqui</div>';
  $('columns').innerHTML = b.columns.map((col, c) => `<div class="column" data-column="${c}"><span class="column-label">COLUNA ${c + 1}</span>${selected ? `<button class="column-destination" data-column-target="${c}" ${selected.zone==='column'&&selected.col===c?'disabled':''}>Mover para cá ↓</button>`:''}${!col.length ? `<button class="empty-pile" data-empty="${c}" aria-label="Mover para coluna vazia ${c + 1}"><span>＋</span><strong>Espaço livre</strong><small>Qualquer carta ou grupo</small></button>` : col.map((x, i) => x.up ? cardHTML(x.id, `data-col="${c}" data-index="${i}" draggable="true"`, selected?.zone === 'column' && selected.col === c && i >= selected.index) : '<div class="back-card" aria-label="Carta fechada"><span>✳</span><small>UMA DESCOBERTA</small></div>').join('')}</div>`).join('');
  document.querySelectorAll('[data-col]').forEach(el => {
    const from = {zone: 'column', col: +el.dataset.col, index: +el.dataset.index};
    el.onclick = () => pick(from);
    bindDrag(el, from);
  });
  document.querySelectorAll('[data-column-target]').forEach(el=>el.onclick=()=>destination({zone:'column',col:+el.dataset.columnTarget}));
  document.querySelectorAll('[data-empty]').forEach(el => el.onclick = () => destination({zone: 'column', col: +el.dataset.empty}));
  document.querySelectorAll('[data-column]').forEach(el => bindDrop(el, {zone: 'column', col: +el.dataset.column}));
  renderPanel();
}
function renderPanel() {
  const panel = $('study-panel'), host = $('study-content');
  panel.classList.toggle('has-card', !!selected);
  panel.classList.toggle('has-feedback', !!state.feedback && !selected);
  $('cancel-selection').hidden = !selected;
  if (selected) {
    const ids = selectedIds(), c = clueCard(CARDS[ids[0]]), k = KINDS[c.kind];
    host.innerHTML = `<div class="panel-eyebrow">${k.symbol} ${k.label.toUpperCase()}${ids.length > 1 ? ` · GRUPO DE ${ids.length}` : ''}</div><h3 id="selected-title">${c.title}</h3><p class="panel-description">${c.description}</p><div class="panel-eyebrow">A QUAL PARASITO PERTENCE?</div><div class="panel-targets">${state.board.families.map((f, pile) => `<button data-target="${pile}"> ${FAMILIES[f].name}<span>↗</span></button>`).join('')}</div><button id="hint" class="hint-button">✧ ${state.hinted.includes(c.id)||state.coins<=5 ? 'Preciso de uma pista · grátis' : 'Preciso de uma pista · −5 moedas'}</button>`;
    document.querySelectorAll('[data-target]').forEach(el => el.onclick = () => destination({zone: 'foundation', pile: +el.dataset.target}));
    $('hint').onclick = hint;
  } else if (state.feedback) {
    host.innerHTML = feedbackHTML(state.feedback, false);
    const relation = $('open-relation');
    if(relation) relation.onclick=()=>openAtlas(CARDS[state.feedback.id].family);
    const next = $('next-action');
    if (next) next.onclick = dismissFeedback;
  } else {
    host.innerHTML = `<div class="panel-eyebrow">SEU GUIA DE DESCOBERTAS</div><div class="panel-symbol">✳</div><h2>Qual é a conexão?</h2><p>Os conceitos estão nas cartas. Sua missão é encontrar o parasito que liga cada pista.</p><ol class="steps"><li><b>1</b><span><strong>Escolha uma carta aberta.</strong><br>Ovo, ciclo, manifestação e diagnóstico.</span></li><li><b>2</b><span><strong>Associe ao parasito.</strong><br>Toque na coleção ou arraste a carta.</span></li><li><b>3</b><span><strong>Leia e descubra.</strong><br>Cada conexão vem com uma explicação.</span></li></ol><div class="panel-note">Também pode reunir cartas do mesmo parasito nas colunas. Uma coluna vazia recebe qualquer carta.</div>`;
  }
}
function clearSelection() { selected = null; render(); message('Seleção cancelada. Escolha outra carta quando quiser.'); }
$('cancel-selection').onclick = clearSelection;
document.addEventListener('keydown', e => { if (e.key === 'Escape' && selected && !$('modal').open && !$('feedback-dialog').open) clearSelection(); });
function pick(from) {
  if (!syncBoard() || blocked() || !Solitaire.stack(state.board, from).length) return;
  state.feedback = null;
  selected = JSON.stringify(selected) === JSON.stringify(from) ? null : from;
  save(); render();
  message(selected ? 'Escolha uma coleção no painel, toque no parasito ou arraste a carta.' : 'Seleção cancelada.');
  const selector = from.zone === 'waste' ? '#waste-card' : `[data-col="${from.col}"][data-index="${from.index}"]`;
  if (selected && window.matchMedia?.('(max-width:900px)').matches) document.querySelector('[data-target]')?.focus({preventScroll: true});
  else document.querySelector(selector)?.focus({preventScroll: true});
}
function bindDrag(el, from) {
  el.ondragstart = e => {
    if (blocked()) { e.preventDefault(); return; }
    dragSource = from;
    e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'parasitotrilha');
  };
  el.ondragend = () => { dragSource = null; };
}
function bindDrop(el, to) {
  el.ondragover = e => { if (dragSource && Solitaire.structural(state.board, dragSource, to)) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; } };
  el.ondrop = e => { e.preventDefault(); if (dragSource) { const from=dragSource;dragSource=null;if(!syncBoard())return;selected=from;destination(to); } };
}
function draw() {
  if (!syncBoard() || blocked() || !state.board.stock.length && !state.board.waste.length) return;
  remember(); const recycle = !state.board.stock.length;
  Solitaire.draw(state.board); selected = null; state.feedback = null;
  save(); render(); message(recycle ? 'Monte reciclado. Continue explorando, sem custo.' : 'Carta comprada. Selecione-a no descarte para ler e associar.');
  $('draw').focus({preventScroll: true});
}
function destination(to) {
  if (!syncBoard() || blocked()) return;
  if (!selected) { message('Escolha uma carta antes de indicar o destino.'); return; }
  if (!Solitaire.structural(state.board, selected, to)) { message('Essa carta precisa de outro destino. Nenhuma moeda foi descontada.'); return; }
  const ids = selectedIds(), id = ids[0];
  let sharedFamily=null;
  if (!Solitaire.canMove(state.board, selected, to)) {
    const family = Solitaire.targetFamily(state.board,to);
    if (ids.every(x => acceptsAssociation(x,family))) {
      sharedFamily=family;
      to={zone:'foundation',pile:state.board.families.indexOf(CARDS[id].family)};
    }
    else {
    ids.forEach(x=>Learning.expose(x,false));
    const before = state.coins;
    state.attempts++; state.streak = 0; state.coins = Math.max(0, before - 10);
    for(const x of ids) if (!state.errors.includes(x)) state.errors.push(x);
    state.reviewed = state.reviewed.filter(x => x !== id);
    state.feedback = {type: 'wrong', id, delta: state.coins - before};
    selected = null; save(); render(); showFeedbackDialog(); return;
    }
  }
  const association = Solitaire.targetFamily(state.board, to) !== null;
  remember(); Solitaire.move(state.board, selected, to);
  state.feedback = null;
  if (association) {
    let delta = 0;
    const fresh = ids.filter(x => !state.mastered.includes(x));
    for (const x of fresh) {
      Learning.expose(x,true);
      state.mastered.push(x); state.attempts++;
      const independent=!state.errors.includes(x)&&!state.hinted.includes(x);
      state.streak=independent?state.streak+1:0;
      if(independent)state.independent.push(x);
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      delta += independent ? 20 + (state.streak % 3 === 0 ? 10 : 0) : state.errors.includes(x)?0:5;
    }
    state.coins += delta;
    state.feedback = {type: 'correct', id, delta, sharedFamily};
  }
  selected = null; save(); render();
  message(association ? `Conexão correta! ${state.feedback.delta ? `+${state.feedback.delta} moedas. ` : ''}Leia a explicação ou escolha a próxima carta.` : 'Espaço reorganizado, sem custo.');
  if (ended()) checkEnd();
}
function feedbackHTML(f, inDialog) {
  const c = CARDS[f.id], family = FAMILIES[c.family];
  if(f.type==='shared') return `<div class="panel-eyebrow">ESSA RELAÇÃO TAMBÉM É VÁLIDA</div><h3 id="feedback-dialog-title">Você percebeu uma conexão real.</h3><p>Essa característica também ocorre no destino escolhido. <b>Nenhuma moeda foi descontada.</b></p><p>Para organizar esta coleção, a carta fica com <strong>${family.name}</strong>. ${c.explanation}</p>${sourceLink(c)}<button class="primary" id="continue">Entendi a relação →</button>`;
  const title = f.type === 'wrong' ? 'Vamos conectar essa pista.' : f.type === 'hint' ? 'Observe este detalhe.' : 'Uma conexão a mais!';
  return `<div class="panel-eyebrow">${f.type === 'wrong' ? 'ERRAR TAMBÉM ENSINA' : f.type === 'hint' ? 'DICA DA CARTA' : 'CONEXÃO CORRETA'}</div><span class="feedback-score ${f.type === 'wrong' ? 'wrong' : ''}">${f.delta > 0 ? '+' : ''}${f.delta} moedas${f.delta >= 30 ? ' · bônus de sequência!' : ''}</span><h3 id="${inDialog ? 'feedback-dialog-title' : 'feedback-title'}">${title}</h3><p><strong>${c.title}</strong></p>${f.sharedFamily!==null&&f.sharedFamily!==undefined?`<p><b>Relação correta com ${FAMILIES[f.sharedFamily].name}.</b> ${associationExplanation(c.id,f.sharedFamily)?.note||'Esta pista é compartilhada.'} A carta foi guardada na coleção de ${family.name} para manter seu conjunto completo.</p>`:''}<p>${c.explanation}</p>${f.type === 'wrong' ? `<p>A carta continua na mesa. Neste contexto, ela se associa a <strong>${family.name}</strong>.</p>` : f.type === 'correct' ? `<p><strong>${family.name}</strong> · ${family.disease}</p>` : ''}<div class="learning-note"><strong>PARA GUARDAR NA MEMÓRIA</strong>${FAMILY_NOTES[c.family]}</div>${sourceLink(c)}${f.sharedFamily!=null?sharedAssociationHTML(c):''}${f.type==='correct'&&state.errors.includes(c.id)?'<p class="learning-note">Conexão refeita após a correção: sem recompensa adicional. Agora tente explicá-la de memória.</p>':''}${f.type === 'correct' ? '<button class="secondary" id="open-relation">Ver ciclo e relações ↗</button>' : ''}${f.type === 'hint' ? `<details><summary>Mostrar o parasito</summary><p>${family.name}</p></details>` : ''}<button class="${inDialog ? 'primary' : 'secondary'}" id="${inDialog ? 'continue' : 'next-action'}">${ended() ? 'Ver resultado' : f.type === 'wrong' ? 'Entendi · tentar novamente' : f.type === 'hint' ? 'Voltar à carta' : 'Continuar descobrindo'} →</button>`;
}
function showFeedbackDialog() {
  $('feedback-dialog-body').innerHTML = feedbackHTML(state.feedback, true);
  $('continue').onclick = dismissFeedback;
  if (!$('feedback-dialog').open) $('feedback-dialog').showModal();
  $('feedback-dialog-title').setAttribute('tabindex','-1');$('feedback-dialog-title').focus({preventScroll:true});
}
function dismissFeedback() {
  const previous = state.feedback;
  state.feedback = null; $('feedback-dialog').close();
  if (previous?.type === 'hint' && !ended()) selected = findCard(previous.id);
  save(); render(); message('Pronto para a próxima conexão.'); checkEnd();
}
$('feedback-dialog').addEventListener('cancel', e => { e.preventDefault(); dismissFeedback(); });
function findCard(id) {
  if (state.board.waste.at(-1) === id) return {zone: 'waste'};
  for (let c = 0; c < 4; c++) {
    const i = state.board.columns[c].findIndex(x => x.id === id && x.up);
    if (i >= 0 && Solitaire.stack(state.board, {zone: 'column', col: c, index: i}).length) return {zone: 'column', col: c, index: i};
  }
  return null;
}
function undo() {
  if (!syncBoard() || blocked() || !state.history.length) return;
  state.board = state.history.pop(); selected = null; state.feedback = null;
  save(); render(); message('Movimento desfeito. Moedas e aprendizado foram mantidos; cada carta pontua uma única vez.');
}
function hint() {
  if (!syncBoard() || blocked() || !selected) return;
  const id = selectedIds()[0], cost = state.hinted.includes(id)||state.coins<=5 ? 0 : 5;
  if (state.coins < cost) { message('São necessárias 5 moedas para uma nova dica.'); return; }
  state.coins -= cost;state.streak=0;
  if (!state.hinted.includes(id)) state.hinted.push(id);
  state.feedback = {type: 'hint', id, delta: -cost};
  selected = null; save(); render(); showFeedbackDialog();
}
let modalReturn=null;
function modal(title, html) {
  if(!$('modal').open)modalReturn=document.activeElement;
  $('modal-title').textContent = title; $('modal-body').innerHTML = html;
  if (!$('modal').open) $('modal').showModal();
  $('modal').scrollTop=0;$('modal-title').setAttribute('tabindex','-1');$('modal-title').focus({preventScroll:true});
}
$('close-modal').onclick = () => $('modal').close();
$('modal').addEventListener('close',()=>{if(modalReturn?.isConnected)modalReturn.focus({preventScroll:true});else document.querySelector('[aria-current="page"]')?.focus({preventScroll:true});if(typeof refreshLearningUI==='function')refreshLearningUI();});
function collection(pile) {
  const f = state.board.families[pile], ids = state.board.foundations[pile], all = expectedCards(f);
  modal(FAMILIES[f].name, `<p>${FAMILIES[f].disease} · ${ids.length - 1} de ${all.length - 1} conexões</p><div class="learning-note">${FAMILY_NOTES[f]}</div><div class="collection-list">${all.map(id => {
    const c = CARDS[id], learned = ids.includes(id);
    return learned ? `<article><span class="type-badge kind-${c.kind}">${KINDS[c.kind].symbol} ${KINDS[c.kind].label} · ✓</span><h3>${c.title}</h3><p>${c.description}</p><details><summary>Entender a conexão</summary><p>${c.explanation}</p>${sourceLink(c)}</details></article>` : `<article class="muted">${KINDS[c.kind].symbol} ${KINDS[c.kind].label} · ainda está na mesa ou no monte</article>`;
  }).join('')}</div>`);
}
function chooseDeck() {
  modal('Qual será sua próxima descoberta?', `<p>Escolha um módulo com quatro coleções para explorar. Cada nova partida tem 40 cartas e começa com 100 moedas.</p><div class="deck-options">${Object.entries(DECKS).map(([key,d]) => `<button class="deck-option" data-deck="${key}"><strong>${d.title} ↗</strong><span>${d.description}</span><small>${d.families ? d.families.map(f => FAMILIES[f].short).join(' · ') : 'Mistura entre as vinte coleções disponíveis'}</small></button>`).join('')}</div><p class="muted" style="margin-top:17px">Escolher um baralho guarda a mesa atual e preserva seu histórico. Para retomar uma mesa, abra Estudar → Meu progresso → Partidas guardadas. Feche esta janela para continuar de onde parou.</p>`);
  document.querySelectorAll('[data-deck]').forEach(el => el.onclick = () => reset(el.dataset.deck));
}
function reset(deck = state.deck) {
  if(!syncBoard())return;
  archiveRound();
  state = newState(deck); selected = null;
  $('modal').close(); $('feedback-dialog').close();
  save(); render(); setView('board'); message('Novo baralho distribuído. Escolha uma carta aberta para começar.');
}
$('restart').onclick = chooseDeck; $('choose-deck').onclick = chooseDeck; $('undo').onclick = undo;
function checkEnd() {
  if (!ended()) return;
  const win = completed() === total();
  modal(win ? 'Coleções completas. Hora de lembrar!' : 'Uma pausa para aprender.', `<div class="summary"><div class="summary-icon">${win ? '✳' : '↻'}</div><p>${win ? 'Você reconheceu as conexões. Agora recupere-as sem pistas na revisão e volte nos próximos dias para consolidar.' : 'As moedas acabaram, mas suas descobertas ficam nesta partida. Revise os erros antes de tentar novamente.'}</p><div class="summary-score">${state.coins}<small>moedas ao final da partida</small></div><div class="summary-grid"><div><strong>${state.independent.length}</strong><span>acertos sem ajuda</span></div><div><strong>${state.mastered.length-state.independent.length}</strong><span>com dica ou correção</span></div><div><strong>${state.bestStreak}</strong><span>melhor sequência</span></div></div><button class="primary" id="play-again">Explorar outro baralho →</button><button class="secondary" id="end-review">Revisar de memória · grátis</button></div>`);
  $('play-again').onclick = chooseDeck; $('end-review').onclick = review;
}
$('help').onclick = () => modal('Conectar é a sua jogada.', `<ol><li><b>Escolha uma carta aberta.</b> Leia sua pista. Os conceitos estão nas próprias cartas, sem perguntas separadas.</li><li><b>Associe ao parasito.</b> Use as opções ao lado da carta, toque na coleção ou arraste. Também pode agrupar cartas do mesmo parasito nas colunas; espaços vazios aceitam qualquer carta ou grupo.</li><li><b>Descubra por que combina.</b> Acertar sem ajuda rende 20 moedas; após uma dica, 5; após ler a correção, a carta completa a coleção sem novas moedas. Três acertos seguidos rendem mais 10. Você pode continuar jogando enquanto a explicação do acerto fica ao lado.</li><li><b>Um erro custa 10 moedas.</b> A carta permanece na mesa. Leia a explicação, feche-a e tente novamente. O saldo nunca fica negativo.</li><li><b>Explore o monte gratuitamente.</b> Compre uma carta por vez e recicle o descarte quando o monte acabar. Cartas fechadas viram quando ficam livres.</li><li><b>Dicas custam 5 moedas.</b> Com 5 moedas ou menos, são gratuitas para você continuar aprendendo. A mesma dica pode ser consultada novamente sem custo. Desfazer restaura a mesa, mas mantém moedas e aprendizado.</li></ol><p>Complete as quatro coleções para vencer. Se o saldo chegar a zero, revise e tente outro baralho. A biblioteca e a revisão são grátis.</p><p class="muted">Cores identificam tipos de carta. Associações consideram o contexto completo: sintomas, medidas preventivas e etapas do ciclo podem ser compartilhados por outras doenças. Teclado: Tab para navegar, Enter para selecionar e Esc para cancelar.</p>`);
function review() { startRecall(); }
$('review').onclick = review;
function archiveRound(){try{localStorage.setItem('parasitotrilha-partida-'+state.roundId,JSON.stringify(state));}catch{}}
function normalize(text) { return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
let libraryFavorites=false;
function isFavorite(id){try{return localStorage.getItem('parasitotrilha-favorito:'+CARDS[id].uid)==='1';}catch{return false;}}
function library() {
  const query = normalize($('library-search').value || ''), family = $('family-filter').value, kind = $('kind-filter').value;
  const found = CARDS.filter(c => (!libraryFavorites||isFavorite(c.id)) && (family === 'all' || c.family === +family) && (kind === 'all' || c.kind === kind) && normalize(`${c.title} ${c.description} ${c.explanation} ${FAMILIES[c.family].name} ${FAMILIES[c.family].disease}`).includes(query));
  $('library-count').textContent = `${found.length} ${found.length === 1 ? 'carta encontrada' : 'cartas encontradas'}`;
  $('library-grid').innerHTML = found.length ? found.map(c => `<article class="library-card kind-${c.kind}"><span class="type-badge kind-${c.kind}">${KINDS[c.kind].symbol} ${KINDS[c.kind].label}</span><h3>${c.title}</h3><p>${c.description}</p><details ${query?'open':''}><summary>Revelar associação e aprender</summary><h3>${FAMILIES[c.family].name}</h3><p>${c.explanation}</p><div class="learning-note"><strong>NÃO CONFUNDA</strong>${FAMILY_NOTES[c.family]}</div>${sourceLink(c)}</details>${sharedAssociationHTML(c)}<div class="library-card-actions"><button data-favorite="${c.id}" aria-pressed="${isFavorite(c.id)}">${isFavorite(c.id)?'★ Favorita':'☆ Favoritar'}</button>${c.kind!=='parasite'?`<button data-recall-card="${c.id}">Praticar</button>`:''}</div></article>`).join('') : `<div class="empty-results"><h3>Nenhuma carta encontrada.</h3><p>Tente outro termo ou limpe os filtros.</p></div>`;
  document.querySelectorAll('[data-favorite]').forEach(el=>el.onclick=()=>{const id=+el.dataset.favorite;try{localStorage.setItem('parasitotrilha-favorito:'+CARDS[id].uid,isFavorite(id)?'0':'1');}catch{}library();document.querySelector(`[data-favorite="${id}"]`)?.focus({preventScroll:true});});
  document.querySelectorAll('[data-recall-card]').forEach(el=>el.onclick=()=>startRecall(null,{ids:[+el.dataset.recallCard]}));
  if($('train-filtered')){$('train-filtered').disabled=!found.some(c=>c.kind!=='parasite');$('train-filtered').onclick=()=>startRecall(null,{ids:found.filter(c=>c.kind!=='parasite').slice(0,20).map(c=>c.id)});}
}
$('family-filter').innerHTML += FAMILIES.map((f,i) => `<option value="${i}">${f.name}</option>`).join('');
$('kind-filter').innerHTML += Object.entries(KINDS).map(([key,k]) => `<option value="${key}">${k.label}</option>`).join('');
$('library-search').oninput = library; $('family-filter').onchange = library; $('kind-filter').onchange = library;
$('favorites-only').onchange=e=>{libraryFavorites=e.target.checked;library();};
$('clear-filters').onclick = () => { libraryFavorites=false;$('favorites-only').checked=false; $('library-search').value = ''; $('family-filter').value = 'all'; $('kind-filter').value = 'all'; library(); };
function setView(view) {
  if(!['board','study','library'].includes(view))view='board';
  activeView=view;selected=null;dragSource=null;render();
  if(window.location&&window.location.hash.slice(1).split('/')[0]!==view)window.location.hash=view;
  $('round-stats').hidden=view!=='board';
  $('game-intro').hidden=view!=='board';
  for(const name of ['board','library','study']) $(name+'-view').hidden=name!==view;
  if(view==='study') renderStudy();
  document.querySelectorAll('[data-view]').forEach(el => { el.classList.toggle('active', el.dataset.view === view); el.setAttribute('aria-current', el.dataset.view === view ? 'page' : 'false'); });
  if (view === 'library') library();
}
document.querySelectorAll('[data-view]').forEach(el => el.onclick = () => setView(el.dataset.view));
$('sources').onclick = () => modal('Ciência por trás das cartas', `<p>200 cartas em 20 coleções de parasitologia médica, com mapas de ciclos e comparações. Teníase e cisticercose são coleções distintas porque representam caminhos diferentes do mesmo parasito.</p><p>As referências estão em cada explicação. Este núcleo não cobre todas as parasitoses nem esquemas terapêuticos e posologias. Este módulo cobre identificação, ciclo, transmissão, hospedeiros, manifestações, diagnóstico e prevenção; considere a pista completa, porque muitos achados não são exclusivos de uma infecção.</p><ul>${FAMILIES.map(f => `<li><a href="${f.source}" target="_blank" rel="noopener noreferrer">CDC · ${f.name} ↗</a></li>`).join('')}</ul><p class="muted">Referências do CDC e do Ministério da Saúde, em inglês e português, consultadas em setembro de 2026. Não há recomendações individuais de diagnóstico ou tratamento. As moedas são fictícias; o progresso fica neste navegador.</p>`);
render(); save();
if (['wrong','hint','shared'].includes(state.feedback?.type)) showFeedbackDialog();
else checkEnd();
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const snapshot = () => ({moedas: state.coins, associacoes: completed(), total: total(), mesa: clone(state.board), cartas: state.board.deckIds.map(id => ({id, tipo: KINDS[CARDS[id].kind].label, titulo: CARDS[id].title, descricao: CARDS[id].description})), explicacao: state.feedback ? CARDS[state.feedback.id].explanation : null});
  const register = t => { try { Promise.resolve(document.modelContext.registerTool(t, {signal: lifecycle.signal})).catch(() => {}); } catch {} };
  register({name:'consultar_mesa',title:'Consultar mesa',description:'Consulta cartas, coleções, moedas e explicação atual.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:snapshot});
  register({name:'associar_cartas',title:'Associar cartas',description:'Tenta uma associação. Acerto novo rende moedas; erro custa 10. Coluna vazia é reorganização gratuita.',inputSchema:{type:'object',properties:{origem:{type:'object',properties:{zone:{enum:['column','waste']},col:{type:'integer',minimum:0,maximum:3},index:{type:'integer',minimum:0}},required:['zone'],additionalProperties:false},destino:{type:'object',properties:{zone:{enum:['column','foundation']},col:{type:'integer',minimum:0,maximum:3},pile:{type:'integer',minimum:0,maximum:3}},required:['zone'],additionalProperties:false}},required:['origem','destino'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input => {if (!input || blocked() || !Solitaire.structural(state.board,input.origem,input.destino)) throw Error('Origem, destino ou momento inválido.'); selected=input.origem; destination(input.destino); return snapshot();}});
  register({name:'comprar_carta',title:'Comprar carta',description:'Compra uma carta ou recicla o descarte gratuitamente.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute:() => {if (blocked()) throw Error('Leia o retorno ou conclua a partida.'); draw(); return snapshot();}});
  register({name:'continuar_apos_explicacao',title:'Continuar após explicação',description:'Fecha o retorno e permite continuar a partida.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute:() => {if (!state.feedback) throw Error('Nenhuma explicação aberta.'); dismissFeedback(); return snapshot();}});
  window.addEventListener('pagehide', () => lifecycle.abort(), {once:true});
}
