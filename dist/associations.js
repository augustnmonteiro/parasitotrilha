/* Vínculos por conceito, com escopo e referência. A ausência de vínculo não prova exclusividade biológica. */
Object.assign(CLUES,{
 'trichuris:prevention':['Saneamento contra ovos do solo','Higiene de alimentos e mãos reduz a ingestão de ovos que amadurecem no solo.'],
 'ancilostomideos:prevention':['Calçados contra larvas do solo','Evitar contato da pele com solo contaminado reduz a entrada de larvas filarioides.'],
 'l-infantum:prevention':['Evitar picadas de flebotomíneos','Proteção pessoal e manejo ambiental reduzem o contato com flebotomíneos.'],
 'l-braziliensis:prevention':['Evitar picadas de flebotomíneos','Proteção pessoal e manejo ambiental reduzem o contato com flebotomíneos.'],
 'giardia:prevention':['Água segura e mãos limpas','Água própria para consumo, higiene das mãos e prevenção da contaminação fecal reduzem a transmissão.'],
 'e-histolytica:prevention':['Água segura e mãos limpas','Água própria para consumo, higiene das mãos e prevenção da contaminação fecal reduzem a transmissão.'],
 'cryptosporidium:prevention':['Água segura e mãos limpas','Água própria para consumo, higiene das mãos e prevenção da contaminação fecal reduzem a transmissão.'],
 'h-nana:symptom':['Dor abdominal em carga elevada','Uma tênia pequena, com ciclo direto e autoinfecção interna, pode causar dor abdominal e diarreia quando há muitos vermes.'],
 'p-falciparum:pitfall':['Malária sem hipnozoítos','Esta espécie de plasmódio não mantém formas hepáticas dormentes; recorrência não deve ser atribuída a hipnozoítos.']
});
const ASSOCIATION_RULES=[
 {cards:['ascaris:cycle'],families:['ascaris','strongyloides','ancilostomideos'],note:'Esses nematódeos podem ter migração larvária pulmonar. Isso não significa a mesma forma infectante: Ascaris chega por ovo ingerido; os outros podem entrar como larvas pela pele.'},
 {cards:['ascaris:prevention','trichuris:prevention'],families:['ascaris','trichuris'],note:'Saneamento e higiene reduzem a ingestão de ovos que amadurecem no solo nos dois ciclos.'},
 {cards:['strongyloides:prevention','ancilostomideos:prevention','ancilostomideos:transmission'],families:['strongyloides','ancilostomideos'],note:'Larvas filarioides do solo podem atravessar a pele nos dois ciclos. Autoinfecção interna é uma distinção de Strongyloides.'},
 {cards:['l-infantum:transmission','l-braziliensis:transmission','l-infantum:prevention','l-braziliensis:prevention'],families:['l-infantum','l-braziliensis'],note:'As duas leishmânias são transmitidas por flebotomíneos que inoculam promastigotas. A distribuição nos tecidos e as manifestações ajudam a separar as coleções.'},
 {cards:['p-falciparum:transmission','p-vivax:transmission','p-falciparum:host','p-vivax:host','p-falciparum:prevention','p-vivax:prevention','p-falciparum:diagnosis','p-falciparum:cycle','p-falciparum:habitat'],families:['p-falciparum','p-vivax'],note:'Anopheles, esporozoítos, gametócitos e fases hepática e sanguínea fazem parte dos dois ciclos. Hipnozoítos e certos detalhes morfológicos não são compartilhados.'},
 {cards:['w-bancrofti:prevention'],families:['w-bancrofti','p-falciparum','p-vivax'],note:'A proteção contra picadas de mosquitos é uma barreira comum. O vetor específico e a forma transmitida precisam ser diferenciados: L3 na filariose e esporozoítos na malária.'},
 {cards:['giardia:prevention','e-histolytica:prevention','cryptosporidium:prevention'],families:['giardia','e-histolytica','cryptosporidium'],note:'A prevenção da contaminação fecal de mãos e água é compartilhada. Oocistos de Cryptosporidium resistem à cloração usual; isso impede tratar todos os métodos de desinfecção como equivalentes.'}
].map(r=>({...r,reviewedAt:'2026-09-13',sources:r.families.map(key=>FAMILIES[FAMILY_KEYS.indexOf(key)].source)}));
const ASSOCIATION_INDEX=new Map();
for(const r of ASSOCIATION_RULES){
 for(const uid of r.cards){
  if(!Object.hasOwn(CARD_BY_UID,uid)||ASSOCIATION_INDEX.has(uid)||!r.families.includes(FAMILY_KEYS[CARD_BY_UID[uid].family]))throw Error('Cadastro de associação inconsistente.');
  if(r.families.some(f=>!FAMILY_KEYS.includes(f))||r.sources.some(url=>!url.startsWith('https://')))throw Error('Referência de associação inválida.');
  ASSOCIATION_INDEX.set(uid,r);
 }
}
// Mantido para compatibilidade com as mesas salvas e os casos. Toda relação passa pelo mesmo cadastro.
for(const c of CARDS)c.related=(ASSOCIATION_INDEX.get(c.uid)?.families||[]).map(key=>FAMILY_KEYS.indexOf(key)).filter(f=>f!==c.family);
function acceptsAssociation(id,family){return CARDS[id]?.family===family||!!ASSOCIATION_INDEX.get(CARDS[id]?.uid)?.families.includes(FAMILY_KEYS[family]);}
function associationExplanation(id,family){return acceptsAssociation(id,family)&&CARDS[id].family!==family?ASSOCIATION_INDEX.get(CARDS[id].uid):null;}
function sharedAssociationHTML(c){
 const rule=ASSOCIATION_INDEX.get(c.uid);if(!rule)return '';
 const families=rule.families.map(key=>FAMILIES[FAMILY_KEYS.indexOf(key)]);
 return `<details class="shared-association"><summary>Por que esta pista vale em mais de uma coleção</summary><p>${rule.note}</p><p><b>Coleções relacionadas:</b> ${families.map(f=>f.name).join(' · ')}.</p><ul>${families.filter((f,i,a)=>a.findIndex(x=>x.source===f.source)===i).map(f=>`<li><a class="reference" href="${f.source}" target="_blank" rel="noopener noreferrer">CDC · ${f.short} ↗</a></li>`).join('')}</ul></details>`;
}
