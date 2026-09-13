/* Identidade independente da posição do array. Nunca reutilizar uma chave para outro conceito. */
const FAMILY_KEYS=['ascaris','schistosoma-mansoni','enterobius','trichuris','giardia','toxoplasma','p-falciparum','strongyloides','ancilostomideos','e-histolytica','taenia-adulto','t-solium-larva','t-cruzi','l-infantum','l-braziliensis','p-vivax','cryptosporidium','w-bancrofti','e-granulosus','h-nana'];
const CONTENT_VERSION='2026-09-12';
for(const c of CARDS){c.uid=FAMILY_KEYS[c.family]+':'+c.kind;c.revision=1;}
const CARD_BY_UID=Object.fromEntries(CARDS.map(c=>[c.uid,c]));
const byKind=(f,k)=>CARDS.find(c=>c.family===f&&c.kind===k);
CARDS[53].related=[15];
// Pistas comuns usam o mesmo enunciado, sem acrescentar um caráter exclusivo da espécie.
for(const f of [6,15]) {
 Object.assign(byKind(f,'transmission'),{title:'Esporozoítos pela picada',description:'Fêmea de Anopheles inocula esporozoítos, que alcançam o fígado.'});
 Object.assign(byKind(f,'host'),{title:'Mosquito como hospedeiro definitivo',description:'A reprodução sexuada ocorre no Anopheles; a fase assexuada ocorre no humano.'});
}
shared([13,14],['prevention']);
shared([0,3],['prevention']);
shared([6,15,17],['prevention']);
byKind(17,'prevention').related=[6,15];
// A prevenção genérica contra mosquitos é compartilhada; a carta não afirma o mesmo vetor.
Object.assign(byKind(17,'prevention'),{title:'Proteção contra picadas de mosquitos',description:'Controle vetorial e proteção pessoal reduzem novas infecções transmitidas por mosquitos.'});
byKind(6,'prevention').related=[15];byKind(15,'prevention').related=[6];
// Pistas clínicas não exibem o nome da associação que se está tentando recordar.
const CLUES={
 'ascaris:prevention':['Saneamento contra ovos do solo','Higiene de alimentos e mãos reduz a ingestão de ovos que amadurecem no solo.'],
 'ascaris:host':['Humano como hospedeiro definitivo','Vermes grandes e cilíndricos reproduzem-se na luz do delgado.'],
 'enterobius:prevention':['Higiene para romper o ciclo doméstico','Mãos, unhas e roupas podem transportar ovos depositados na região perianal.'],
 'enterobius:host':['Ciclo direto e postura perianal','Transmissão entre pessoas sem hospedeiro intermediário.'],
 'schistosoma-mansoni:pitfall':['Espinho lateral ou terminal?','O ovo desta coleção tem uma projeção lateral proeminente e eliminação fecal.'],
 'trichuris:pitfall':['Tampões não são filamentos','Ovo em barril, com um tampão em cada extremidade.'],
 'toxoplasma:diagnosis':['Sorologia na infecção com cistos teciduais','Anticorpos precisam ser interpretados no tempo; IgM isolada não data a infecção.'],
 'e-histolytica:pitfall':['Amebas parecidas, patogenicidade diferente','Cistos morfologicamente semelhantes podem pertencer a espécies não invasivas.'],
 'taenia-adulto:pitfall':['Ovo não define a espécie','Ovos dos cestódeos adquiridos por carne bovina ou suína são indistinguíveis na microscopia usual.'],
 't-solium-larva:egg':['Ovo de cestódeo por via fecal-oral','A ingestão leva a larvas nos tecidos; a fonte é um portador humano do adulto intestinal.'],
 't-solium-larva:symptom':['Crises epilépticas e larvas teciduais','O quadro neurológico depende do número, do estágio e da localização das lesões.'],
 't-solium-larva:prevention':['Bloquear ovos de origem humana','Saneamento, mãos limpas e identificação de portadores do adulto intestinal.'],
 't-solium-larva:host':['Humano como intermediário acidental','Neste caminho, o humano abriga larvas teciduais de um cestódeo de origem humana.'],
 't-solium-larva:pitfall':['Pode ocorrer sem consumo de porco','Ovos de origem fecal humana causam a infecção tecidual; larvas na carne levam ao adulto intestinal.'],
 't-cruzi:stage':['Tripomastigota sanguíneo','Forma circulante com cinetoplasto evidente; amastigotas multiplicam-se em tecidos humanos.'],
 't-cruzi:diagnosis':['Método muda com a fase','Pesquisa direta no sangue na fase aguda; testes sorológicos distintos na fase crônica.'],
 'l-infantum:transmission':['Promastigotas pela picada','Flebotomíneo infectado inocula promastigotas.'],
 'l-braziliensis:transmission':['Promastigotas pela picada','Flebotomíneo infectado inocula promastigotas.'],
 'l-infantum:pitfall':['Padrão visceral e sistêmico','Febre prolongada, aumento de baço e fígado e alterações sanguíneas diferem da úlcera cutânea localizada.'],
 'l-braziliensis:diagnosis':['Investigar a borda da lesão','Pesquisa parasitária e testes moleculares no tecido ajudam; a espécie pode modificar o risco mucoso.'],
 'l-braziliensis:pitfall':['A lesão pode chegar à mucosa','Uma úlcera cutânea cicatrizada não elimina a possibilidade de acometimento mucoso posterior.'],
 'p-vivax:habitat':['Fígado dormente e hemácias jovens','Hipnozoítos persistem no fígado; as formas sanguíneas têm preferência por reticulócitos.'],
 'p-vivax:diagnosis':['Hemácias aumentadas e granulações','Esfregaço pode mostrar hemácias aumentadas com granulações de Schüffner e trofozoítos ameboides.'],
 'p-vivax:pitfall':['Recaídas não excluem gravidade','A espécie com hipnozoítos e preferência por reticulócitos também pode causar doença grave.'],
 'cryptosporidium:transmission':['Oocistos infectantes na água','Ingestão de oocistos já infectantes; também há transmissão por contato com pessoas e animais.'],
 'cryptosporidium:diagnosis':['Pesquisar oocistos pequenos','Coloração acidorresistente, antígeno ou PCR; o parasitológico habitual pode precisar de método específico.'],
 'cryptosporidium:pitfall':['Cisto oval ou oocisto pequeno?','Oocisto arredondado de 4–6 µm difere do cisto oval maior de um flagelado.'],
 'cryptosporidium:host':['Pessoas e animais no ciclo','Espécies intestinais com oocistos de 4–6 µm variam na participação de reservatórios animais.'],
 'h-nana:host':['Intermediário não é obrigatório','Cestódeo com ciclo direto, autoinfecção interna e artrópodes intermediários facultativos.'],
 'h-nana:pitfall':['Filamentos não são tampões polares','O ovo tem filamentos entre membranas e oncosfera com seis ganchos.']
};
function clueCard(c){const x=CLUES[c.uid];return x?{...c,title:x[0],description:x[1]}:c;}
// Cada prompt especifica a forma, a fase ou a relação que deve ser recuperada.
const FORM_FOCUS=['ovo fértil típico e ovo decorticado','ovo eliminado nas fezes','ovo obtido por fita perianal','ovo fecal em forma de barril','cisto maduro transmissível','cisto de persistência tecidual','gametócito sanguíneo','larva geralmente encontrada nas fezes','ovo fecal e sua diferenciação entre espécies','cisto maduro','larva na carne infectante para humanos','forma ingerida que origina larvas humanas','forma circulante no sangue humano','forma encontrada no tecido visceral','forma encontrada na lesão cutânea','forma responsável pela recaída','oocisto encontrado nas fezes','microfilária no sangue','forma larvária em órgãos humanos','ovo encontrado nas fezes'];
const PITFALL_QUESTIONS=[
 'Um ovo recém-eliminado já infecta outra pessoa? O que precisa acontecer antes?',
 'Como posição do espinho e amostra ajudam a diferenciar S. mansoni de S. haematobium?',
 'Por que um exame de fezes negativo não afasta esta hipótese?',
 'Qual é a diferença entre tampões e filamentos polares?',
 'O mecanismo de diarreia exige invasão da mucosa? Compare com amebíase invasiva.',
 'O oocisto recém-eliminado pelo felídeo já infecta? Diferencie do cisto na carne.',
 'Esta espécie produz hipnozoítos? O que isso muda ao interpretar recorrências?',
 'Como a autoinfecção mantém a doença por anos e qual contexto pode torná-la perigosa?',
 'É possível distinguir Necator e Ancylostoma pelo ovo usual?',
 'Um cisto parecido com E. histolytica prova infecção por espécie invasiva? Como esclarecer?',
 'Os ovos permitem distinguir T. saginata de T. solium?',
 'Uma pessoa que não come porco pode desenvolver cisticercose? Explique a exposição.',
 'Na transmissão vetorial clássica, o parasito está na saliva ou nas fezes do barbeiro?',
 'Qual padrão de órgãos e sintomas diferencia a forma visceral da tegumentar?',
 'A cicatrização da úlcera elimina o risco de manifestação mucosa?',
 'A possibilidade de recaída significa que a doença é sempre benigna?',
 'Como separar oocistos pequenos de cistos de Giardia na investigação fecal?',
 'Linfedema isolado confirma filariose? Que evidência é necessária?',
 'Por que não se esperam ovos do parasito nas fezes humanas?',
 'O ovo apresenta filamentos ou tampões? Com que estrutura pode ser confundido?'
];
function recallPrompt(c){
 const specific={
  egg:`Descreva o ${FORM_FOCUS[c.family]}. Indique as estruturas que o distinguem.`,
  stage:`Identifique e descreva: ${FORM_FOCUS[c.family]}. Onde essa forma é encontrada e qual seu papel?`,
  transmission:`Reconstrua a exposição que infecta o humano por ${FAMILIES[c.family].short}: forma, origem e porta de entrada.`,
  diagnosis:`Na apresentação de ${FAMILIES[c.family].disease.toLowerCase()} estudada nesta coleção, qual amostra e método demonstram a infecção? Explique a escolha pelo ciclo.`,
  cycle:`Explique esta parte do ciclo de ${FAMILIES[c.family].short}: ${CYCLES[c.family][2]}. Qual etapa vem antes e qual vem depois?`,
  habitat:`Localize no humano as formas de ${FAMILIES[c.family].short}; diferencie a forma que permanece da que migra ou circula.`,
  symptom:`Explique o mecanismo desta manifestação em ${FAMILIES[c.family].short}: ${clueCard(c).title}. Relacione forma, local e lesão.`,
  prevention:`Qual barreira impede a transmissão de ${FAMILIES[c.family].short}? Relacione a medida à forma e à exposição.`,
  host:`No ciclo de ${FAMILIES[c.family].short}, quem abriga a reprodução adulta ou sexuada? Explique também os papéis de vetor e intermediário, se existirem.`,
  pitfall:PITFALL_QUESTIONS[c.family]
 };
 return specific[c.kind];
}
function recallRubric(c){
 if(c.kind==='cycle')return [CYCLES[c.family][1],CYCLES[c.family][2],CYCLES[c.family][3]];
 return [c.title,c.description,c.explanation];
}
const CLINICAL_CONTEXT={
 0:'A pesquisa fecal pode ser negativa antes de haver adultos produtores de ovos. Relacione fase pulmonar e período pré-patente.',
 1:'A carga parasitária e o número de amostras influenciam a detecção de ovos. O dano tecidual não depende de vermes soltos no fígado.',
 2:'A coleta perianal deve anteceder banho e evacuação; coletas em manhãs distintas podem melhorar a detecção.',
 4:'Eliminação intermitente pode justificar amostras de fezes em dias diferentes; sintomas isolados não identificam o agente.',
 5:'Interprete sorologia com o tempo, a gestação e o quadro clínico. IgM isolada não confirma infecção recente.',
 7:'Corticoides podem precipitar hiperinfecção: a autoinfecção se acelera e aumenta a carga de larvas, sobretudo no trajeto intestino–pulmão. Na disseminação, larvas alcançam outros órgãos. Eosinofilia pode estar ausente; uma amostra fecal negativa não exclui a infecção.',
 9:'Microscopia usual pode não separar E. histolytica de espécies semelhantes. Antígeno específico ou método molecular ajudam a esclarecer.',
 11:'Número, localização e estágio das lesões modificam a apresentação e a abordagem. Ovos nas fezes investigam teníase concomitante, não demonstram cisticercos cerebrais.',
 12:'Na fase aguda há maior chance de demonstração direta; na crônica a parasitemia é baixa e variável. A sorologia usa testes distintos.',
 15:'Recorrência pode ser recaída, recrudescência ou reinfecção. A história de nova exposição e a avaliação clínica são necessárias.',
 16:'Solicitar o método apropriado importa: pesquisa fecal de rotina pode não incluir técnicas para pequenos oocistos.',
 18:'Imagem e contexto orientam a investigação. Sorologia negativa não exclui todos os casos; estágio e localização do cisto importam.'
};
byKind(7,'pitfall').explanation=CLINICAL_CONTEXT[7];
byKind(7,'pitfall').source='https://www.cdc.gov/strongyloides/hcp/clinical-overview/index.html';
RELATIONS[7]+=' Corticoides podem acelerar esse circuito e precipitar hiperinfecção.';
const CYCLE_BRANCHES={
 0:[['Ambiente','Ovo fecal → embrionamento → ovo infectante'],['Migração','Larva → pulmão → deglutição → adulto intestinal']],
 1:[['Humano → ambiente','Ovo retido causa lesão; ovo que alcança a água libera miracídio'],['Caramujo → humano','Biomphalaria → cercária → pele']],
 5:[['Felídeo → ambiente','Oocisto eliminado → esporulação → ingestão'],['Carne → humano','Cisto com bradizoítos → ingestão'],['Humano → feto','Taquizoítos podem atravessar a placenta'],['Persistência','Cisto tecidual → possível reativação']],
 7:[['Saída ao ambiente','Rabditoide nas fezes → desenvolvimento no solo → filarioide'],['Vida livre','Adultos de vida livre no solo → larvas → filarioides'],['Autoinfecção','Filarioide no corpo → penetração intestinal ou perianal → novo ciclo'],['Hiperinfecção','Amplificação da autoinfecção → carga larvária elevada']],
 9:[['Ciclo luminal','Trofozoíto → encistamento → cisto nas fezes'],['Invasão','Parede colônica → circulação portal → fígado']],
 10:[['Carne com larva → humano','Cisticerco → adulto no delgado → teníase'],['Ovo de T. solium → humano','Oncosfera → larva tecidual → cisticercose']],
 11:[['Ovo → humano','Oncosfera → tecidos → cisticerco'],['Carne com cisticerco → humano','Outro caminho: adulto intestinal, com teníase']],
 12:[['Via vetorial','Fezes de triatomíneo → lesão ou mucosa'],['Via oral','Alimento contaminado → entrada digestiva'],['Via congênita','Transmissão da pessoa gestante ao feto']],
 15:[['Fase imediata','Fígado → merozoítos → hemácias'],['Dormência','Hipnozoíto hepático → reativação → recaída'],['Continuação no vetor','Gametócitos → Anopheles → esporozoítos']],
 16:[['Transmissão','Oocisto de parede espessa → fezes → outro hospedeiro'],['Autoinfecção','Oocisto de parede fina → novo ciclo no intestino']],
 18:[['Ciclo habitual','Canídeo com adulto → ovo → herbívoro com cisto → vísceras ingeridas pelo canídeo'],['Humano acidental','Ovo ingerido → cistos nos órgãos; usualmente sem continuação']],
 19:[['Ciclo direto','Ovo → cisticercoide na vilosidade → adulto'],['Autoinfecção','Ovo eclode no intestino → nova invasão de vilosidade'],['Ciclo facultativo','Artrópode com cisticercoide → ingestão']]
};
const GLOSSARY={
 'Forma infectante':'Forma capaz de iniciar infecção em um hospedeiro específico. Indique sempre: infectante para quem?',
 'Forma diagnóstica':'Forma ou evidência procurada na amostra; pode ser diferente da forma que iniciou a infecção.',
 'Hospedeiro definitivo':'Abriga o adulto sexuado ou a reprodução sexuada do parasito.',
 'Hospedeiro intermediário':'Abriga desenvolvimento larvário ou reprodução assexuada em um ciclo com hospedeiros distintos.',
 'Reservatório':'População que mantém o agente e pode servir como fonte de infecção.',
 'Vetor':'Organismo que transmite o agente. Pode também ser hospedeiro intermediário ou definitivo.',
 'Autoinfecção':'Novo ciclo no mesmo hospedeiro a partir das formas já presentes, sem exigir nova exposição externa.',
 'Período pré-patente':'Intervalo entre a infecção e a possibilidade de detectar formas do parasito pelo método considerado.',
 'Recaída malárica':'Novo episódio sanguíneo originado de hipnozoítos hepáticos, como em P. vivax.',
 'Recrudescência':'Reaparecimento da parasitemia por formas sanguíneas que persistiram.',
 'Reinfecção':'Nova infecção após uma nova exposição ao agente.',
 'Oncosfera':'Embrião com seis ganchos presente no ovo de cestódeos.',
 'Cisticerco':'Forma larvária vesicular de Taenia, distinta do verme adulto e do ovo.',
 'Cinetoplasto':'Estrutura com DNA mitocondrial presente em tripanossomatídeos, útil na leitura morfológica.'
};
