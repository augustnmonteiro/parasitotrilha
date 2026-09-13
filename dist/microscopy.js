/* Fotografias identificadas e liberadas para reutilização nos respectivos registros PHIL. */
const MICROGRAPHS=[
 {pid:410,family:0,title:'Ovo fértil de Ascaris',url:'410/410',credit:'CDC / Dr. Mae Melvin',scale:'400× · preparo não informado',alt:'Ovo oval de casca espessa em campo microscópico.',note:'Reconheça a casca e o contorno. A camada mamilonada pode ser pouco evidente neste exemplar; existem ovos decorticados.'},
 {pid:652,family:3,title:'Ovo de Trichuris',url:'652/652',credit:'CDC / Dr. Mae Melvin',scale:'400× · preparo não informado',alt:'Ovo em formato de barril com uma projeção em cada extremidade.',note:'Os tampões polares, um em cada extremidade, são a pista central. Não são os filamentos de H. nana.'},
 {pid:5229,family:2,title:'Ovos de Enterobius',url:'5229/5229',credit:'CDC',scale:'Fita de celulose · aumento não informado',alt:'Vários ovos de contorno assimétrico em uma amostra coletada por fita.',note:'O contorno plano-convexo deve ser interpretado junto da coleta perianal. A imagem conecta morfologia e escolha da amostra.'},
 {pid:4841,family:1,title:'Ovo de Schistosoma mansoni',url:'20031013/27a2193351934dfb810142590025f258/4841',credit:'CDC',scale:'Aumento e preparo não informados',alt:'Ovo alongado com projeção na lateral.',note:'O espinho lateral ajuda a reconhecer S. mansoni. Não confunda posição do espinho com um tampão polar.'},
 {pid:7832,family:4,title:'Cisto de Giardia duodenalis',url:'7832/7832',credit:'CDC / DPDx – Melanie Moser',scale:'Tricrômico · aumento não informado',alt:'Forma oval delimitada por parede, corada em preparação microscópica.',note:'O cisto é a forma resistente de transmissão. A contagem dos núcleos depende do plano focal; não exija quatro núcleos visíveis em toda fotografia.'},
 {pid:7833,family:4,title:'Trofozoíto de Giardia duodenalis',url:'7833/7833',credit:'CDC / DPDx – Melanie Moser',scale:'Tricrômico · 1000×',alt:'Forma piriforme e simétrica em preparação corada.',note:'Compare a forma piriforme do trofozoíto com o contorno oval do cisto. O trofozoíto coloniza o intestino; o cisto sustenta a transmissão.'},
 {pid:4829,family:7,title:'Larva rabditoide de Strongyloides',url:'4829/4829',credit:'CDC',scale:'Aumento e preparo não informados',alt:'Larva alongada e curvada em preparação microscópica.',note:'A identificação detalhada considera cavidade bucal curta e primórdio genital proeminente. Essas estruturas exigem resolução e foco adequados; o contorno isolado não confirma a espécie.'}
].map(m=>({...m,src:'https://wwwn.cdc.gov/phil/PHIL_Images/'+m.url+'_lores.jpg',source:'https://wwwn.cdc.gov/phil/Details.aspx?pid='+m.pid}));
function photoHTML(m){return `<figure class="micrograph"><a href="${m.src}" target="_blank" rel="noopener noreferrer" aria-label="Ampliar microfotografia em outra aba"><img src="${m.src}" alt="${m.alt}" width="600" height="400" loading="eager" referrerpolicy="no-referrer"></a><figcaption>${m.scale}<br>${m.credit} · PHIL ${m.pid} · Domínio público<br><a href="${m.source}" target="_blank" rel="noopener noreferrer">Registro e imagem original ↗</a></figcaption></figure>`;}
function bindPhotoErrors(){document.querySelectorAll('.micrograph img').forEach(img=>img.onerror=()=>{img.hidden=true;const link=img.closest('a');link.textContent='Fotografia indisponível aqui. Abrir imagem no CDC ↗';});}
function renderMicroscopy(){
 $('study-tab-content').innerHTML=`<div class="progress-intro"><h3>Olhe a estrutura. Depois conecte o ciclo.</h3><p>Fotografias reais, com variações de preparo e foco. O aumento declarado não equivale a uma régua na tela. Abra a imagem para examinar os detalhes.</p><button class="secondary" id="photo-practice">Praticar identificação sem legenda</button></div><div class="microscopy-grid">${MICROGRAPHS.map(m=>`<article><h4>${m.title}</h4>${photoHTML(m)}<p>${m.note}</p><button class="secondary" data-photo-atlas="${m.family}">Relacionar ao ciclo →</button></article>`).join('')}</div>`;
 $('photo-practice').onclick=()=>startPhoto();document.querySelectorAll('[data-photo-atlas]').forEach(el=>el.onclick=()=>openAtlas(+el.dataset.photoAtlas));bindPhotoErrors();
}
let photoOrder=[],photoIndex=0;
function startPhoto(){photoOrder=Solitaire.shuffle(MICROGRAPHS.map((_,i)=>i));photoIndex=0;renderPhoto();}
function renderPhoto(){
 const m=MICROGRAPHS[photoOrder[photoIndex]],others=Solitaire.shuffle([...new Set(MICROGRAPHS.map(x=>x.family))].filter(f=>f!==m.family)).slice(0,3),choices=Solitaire.shuffle([m.family,...others]);
 modal(`Microscopia · ${photoIndex+1} de ${photoOrder.length}`,`<p>Qual parasito é compatível com esta preparação? Considere forma, contorno e estruturas visíveis.</p>${photoHTML(m)}<div class="photo-options">${choices.map(f=>`<button class="secondary" data-photo-answer="${f}">${FAMILIES[f].name}</button>`).join('')}</div><div id="photo-result" role="status"></div>`);
 let checked=false;
 document.querySelectorAll('[data-photo-answer]').forEach(el=>el.onclick=()=>{
  if(checked)return;checked=true;const correct=+el.dataset.photoAnswer===m.family;
  Learning.expose((m.pid===7833?concept(4,'habitat'):formCard(m.family)).id,correct);Learning.caseResult('caso-'+(1000+m.pid),m.family,+el.dataset.photoAnswer,correct);refreshLearningUI();
  document.querySelectorAll('[data-photo-answer]').forEach(b=>b.disabled=true);
  $('photo-result').innerHTML=`<div class="review-result"><b>${correct?'Identificação compatível.':'Vamos conferir as estruturas.'}</b><h3>${m.title}</h3><p>${m.note}</p><p>${RELATIONS[m.family]}</p><button class="primary" id="next-photo">${photoIndex+1===photoOrder.length?'Concluir treino':'Próxima fotografia'} →</button></div>`;
  $('next-photo').onclick=()=>{photoIndex++;if(photoIndex===photoOrder.length){$('modal').close();renderMicroscopy();}else renderPhoto();};$('photo-result').scrollIntoView({block:'nearest'});
 });bindPhotoErrors();
}
