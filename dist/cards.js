/* Cada carta representa um elemento biológico ou clínico, não um valor de baralho. */
const FAMILIES=[
 {name:'Ascaris lumbricoides',disease:'Ascaridíase',short:'Ascaris',source:'https://www.cdc.gov/dpdx/ascariasis/index.html'},
 {name:'Schistosoma mansoni',disease:'Esquistossomose',short:'Schistosoma',source:'https://www.cdc.gov/dpdx/schistosomiasis/index.html'},
 {name:'Enterobius vermicularis',disease:'Enterobíase',short:'Enterobius',source:'https://www.cdc.gov/dpdx/enterobiasis/index.html'},
 {name:'Trichuris trichiura',disease:'Tricuríase',short:'Trichuris',source:'https://www.cdc.gov/dpdx/trichuriasis/index.html'}
];
const KINDS={parasite:{label:'Parasito',symbol:'◎'},egg:{label:'Ovo',symbol:'◉'},symptom:{label:'Manifestação',symbol:'✚'},transmission:{label:'Transmissão',symbol:'↗'},diagnosis:{label:'Diagnóstico',symbol:'⌕'},cycle:{label:'Ciclo de vida',symbol:'↻'},host:{label:'Hospedeiro / vetor',symbol:'♧'},pitfall:{label:'Não confunda',symbol:'≠'}};
const CARDS=[
 [0,'parasite','Ascaris lumbricoides','Lombriga · nematódeo intestinal.','O adulto vive no intestino delgado. Associe a ele as características do ciclo e da ascaridíase.'],
 [0,'egg','Ovo com camada mamilonada','Casca espessa; revestimento externo irregular no ovo fértil típico.','O ovo fértil típico de Ascaris tem camada externa mamilonada. Há também ovos decorticados, sem essa camada.'],
 [0,'symptom','Obstrução por vermes adultos','Grande carga de vermes pode bloquear o intestino delgado.','Infecções intensas por Ascaris podem causar obstrução intestinal. Muitas infecções leves são assintomáticas.'],
 [0,'transmission','Ovo ingerido → pulmão → intestino','Ingestão de ovos embrionados; as larvas passam pelos pulmões.','Após ingerir ovos infectantes de Ascaris, ocorre migração larvária pulmonar antes do retorno ao intestino.'],
 [0,'diagnosis','Ovos mamilonados nas fezes','Microscopia fecal identifica a morfologia do ovo fértil típico.','A pesquisa de ovos nas fezes é a forma usual de diagnóstico da ascaridíase intestinal.'],
 [0, "cycle", "Migração pulmonar antes do adulto", "Larva alcança alvéolos, sobe à faringe e é deglutida.", "A fase pulmonar antecede a maturação intestinal da lombriga."],
 [1,'parasite','Schistosoma mansoni','Trematódeo dos vasos mesentéricos.','O verme adulto habita vasos sanguíneos. Boa parte da doença resulta da reação aos ovos nos tecidos.'],
 [1,'egg','Ovo com espinho lateral','Projeção lateral proeminente; pode ser eliminado nas fezes.','O espinho lateral é uma característica do ovo de S. mansoni, diferente do espinho terminal de S. haematobium.'],
 [1,'symptom','Fibrose periportal','Forma crônica pode evoluir com hipertensão portal e aumento do baço.','Na esquistossomose por S. mansoni, ovos retidos podem desencadear inflamação e fibrose hepática. Nem toda infecção evolui assim.'],
 [1,'transmission','Cercária atravessa a pele','Contato com água doce; larvas liberadas por caramujos.','Cercárias liberadas por Biomphalaria penetram a pele humana. O ovo não é a forma que infecta a pessoa.'],
 [1,'diagnosis','Espinho lateral na amostra fecal','Pesquisa microscópica de ovos; pode utilizar Kato-Katz.','O encontro de ovos com espinho lateral nas fezes apoia o diagnóstico de infecção por S. mansoni.'],
 [1, "cycle", "Ovo → miracídio → caramujo", "Na água, o miracídio eclode e infecta Biomphalaria.", "O caramujo libera cercárias, que infectam humanos pela pele."],
 [2,'parasite','Enterobius vermicularis','Oxiúro · pequeno nematódeo intestinal.','Fêmeas migram para a região perianal para depositar ovos, frequentemente à noite.'],
 [2,'egg','Ovo com um lado achatado','Assimétrico, com uma face plana e outra convexa.','O ovo de Enterobius tem aspecto plano-convexo, frequentemente comparado à letra D.'],
 [2,'symptom','Coceira anal à noite','Prurido perianal, com possível interrupção do sono.','O prurido perianal noturno é típico da enterobíase e se relaciona à migração da fêmea e à postura dos ovos.'],
 [2,'transmission','Mãos levam ovos à boca','Ovos da região perianal podem contaminar dedos e objetos.','A ingestão de ovos de Enterobius pode ocorrer por mãos ou objetos contaminados. A autoinfecção favorece a persistência.'],
 [2,'diagnosis','Fita adesiva perianal','Coleta de ovos pela manhã, antes da higiene e da evacuação.','O método da fita adesiva pesquisa ovos de Enterobius na região perianal. O exame de fezes tem menor utilidade nessa infecção.'],
 [2, "cycle", "Ovos infectantes em poucas horas", "Após a postura perianal, o ovo amadurece rapidamente.", "A maturação rápida dos ovos do oxiúro favorece transmissão doméstica."],
 [3,'parasite','Trichuris trichiura','Verme em forma de chicote.','A porção anterior fina se insere na mucosa do intestino grosso.'],
 [3,'egg','Ovo com tampões polares','Formato de barril ou limão, com um tampão em cada extremidade.','Os dois tampões polares são uma característica dos ovos de Trichuris trichiura.'],
 [3,'symptom','Prolapso retal em infecção intensa','Pode ocorrer em crianças com alta carga parasitária e diarreia.','Infecções intensas por Trichuris podem causar diarreia e prolapso retal. O sinal não é exclusivo da tricuríase.'],
 [3,'transmission','Ovo ingerido → intestino grosso','Ovos amadurecem no solo; o ciclo não inclui migração pulmonar.','Trichuris é adquirido pela ingestão de ovos embrionados. Após eclodir no intestino delgado, o parasito se estabelece no intestino grosso.'],
 [3,'diagnosis','Tampões polares nas fezes','Microscopia revela ovos com duas extremidades características.','A identificação de ovos com tampões polares em amostra fecal é utilizada no diagnóstico da tricuríase.'],
 [3, "cycle", "Sem passagem pulmonar obrigatória", "Ovos embrionados ingeridos liberam larvas; adultos se estabelecem no cólon.", "Trichuris não realiza a migração pulmonar típica de Ascaris."],
].map((c,id)=>({id,family:c[0],kind:c[1],title:c[2],description:c[3],explanation:c[4],source:c[5]||FAMILIES[c[0]].source}));

// Novas famílias e categorias mantêm os IDs das 24 cartas originais.
Object.assign(KINDS, {
 stage: {label:'Forma do parasito',symbol:'◉'},
 prevention: {label:'Prevenção',symbol:'◇'},
 habitat: {label:'Local no corpo',symbol:'⌖'}
});
FAMILIES.push(
 {name:'Giardia duodenalis',disease:'Giardíase',short:'Giardia',source:'https://www.cdc.gov/dpdx/giardiasis/index.html'},
 {name:'Toxoplasma gondii',disease:'Toxoplasmose',short:'Toxoplasma',source:'https://www.cdc.gov/dpdx/toxoplasmosis/index.html'},
 {name:'Plasmodium falciparum',disease:'Malária',short:'P. falciparum',source:'https://www.cdc.gov/dpdx/malaria/index.html'},
 {name:'Strongyloides stercoralis',disease:'Estrongiloidíase',short:'Strongyloides',source:'https://www.cdc.gov/dpdx/strongyloidiasis/index.html'}
);
const EXTRA_CARDS=[
 [0,'prevention','Saneamento contra ovos do solo','Higiene de alimentos e mãos reduz a ingestão de ovos da lombriga.','Saneamento interrompe a contaminação fecal do solo. A medida também previne outras geo-helmintíases.','https://www.cdc.gov/sth/about/ascariasis.html'],
 [0,'habitat','Adultos no intestino delgado','Vermes cilíndricos grandes ficam na luz intestinal após a migração pulmonar.','O adulto de Ascaris habita o intestino delgado; as larvas passam antes pelos pulmões.'],
 [1,'prevention','Evitar água doce com cercárias','Prevenção envolve saneamento e redução do contato com água de transmissão.','Para S. mansoni, o risco está na penetração das cercárias pela pele, não na ingestão do ovo.'],
 [1,'habitat','Vermes nos vasos mesentéricos','Adultos vivem em veias que drenam o intestino, e não soltos na luz intestinal.','S. mansoni é um trematódeo sanguíneo; os ovos atravessam tecidos para alcançar as fezes.'],
 [2,'prevention','Higiene para romper a autoinfecção','Mãos, unhas, roupa íntima e de cama merecem atenção na infecção por oxiúros.','Ovos perianais podem chegar às mãos e à boca. Higiene reduz reinfecção e transmissão.'],
 [2,'habitat','Ceco e região perianal','Adultos no intestino grosso; fêmeas grávidas migram até a região perianal.','O deslocamento para depositar ovos ajuda a explicar a coceira noturna da enterobíase.'],
 [3,'prevention','Solo sem contaminação fecal','Saneamento e higiene evitam a ingestão de ovos do verme em chicote.','Ovos de Trichuris precisam amadurecer no ambiente antes de se tornarem infectantes.'],
 [3,'habitat','Parte fina fixada no cólon','O verme em chicote insere a extremidade anterior na mucosa do intestino grosso.','Trichuris ocupa principalmente o ceco e o cólon; sua fixação pode causar lesão local.'],
 [4,'parasite','Giardia duodenalis','Protozoário flagelado do intestino delgado.','Também chamada G. lamblia ou G. intestinalis. Possui cistos e trofozoítos, não ovos de helminto.'],
 [4,'stage','Cisto oval com quatro núcleos','Forma madura resistente, com quatro núcleos, importante na transmissão fecal-oral.','O cisto maduro de Giardia costuma ter quatro núcleos. Não o confunda com um ovo de verme.'],
 [4,'symptom','Diarreia e má absorção','Distensão e diarreia após ingestão de cistos de um protozoário flagelado.','Giardíase pode prejudicar a absorção intestinal. Esses sintomas, sozinhos, não estabelecem o diagnóstico.'],
 [4,'transmission','Cistos na água ingerida','Ingestão de cistos de um flagelado em água, alimentos ou mãos contaminadas.','Giardia utiliza a via fecal-oral. O trofozoíto coloniza o intestino após o desencistamento.'],
 [4,'diagnosis','Antígeno do flagelado nas fezes','Pesquisa de antígenos ou identificação de cistos e trofozoítos em amostra fecal.','Testes de antígeno e microscopia são utilizados para Giardia; amostras repetidas podem ser necessárias.'],
 [4, "cycle", "Desencistar, aderir, encistar", "Cistos liberam trofozoítos flagelados no delgado; novos cistos saem nas fezes.", "O encistamento permite sobreviver fora do intestino e transmitir giardíase."],
 [4,'prevention','Água segura contra cistos','Evitar engolir água recreativa e garantir água própria para consumo.','Cistos de Giardia podem persistir na água. Higiene das mãos também reduz a transmissão.','https://www.cdc.gov/giardia/prevention/index.html'],
 [4,'habitat','Disco adesivo no intestino delgado','Trofozoítos flagelados aderem à mucosa por um disco ventral.','Giardia permanece sobretudo na porção proximal do intestino delgado, sem uma fase sanguínea habitual.'],
 [5,'parasite','Toxoplasma gondii','Protozoário intracelular; felídeos são os hospedeiros definitivos.','A reprodução sexuada ocorre nos felídeos. Humanos e outros animais abrigam formas teciduais.'],
 [5,'stage','Cisto com bradizoítos','Forma tecidual persistente de um protozoário; abriga organismos de multiplicação lenta.','Bradizoítos persistem em cistos de Toxoplasma. Taquizoítos são formas de multiplicação rápida.'],
 [5,'symptom','Encefalite por reativação','Cistos de um protozoário podem reativar quando a imunidade celular está comprometida.','Toxoplasma pode causar encefalite em imunossupressão. A infecção também pode ser assintomática.'],
 [5,'transmission','Carne com cistos teciduais','Carne malcozida com bradizoítos pode transmitir este protozoário.','Toxoplasma também pode ser adquirido por oocistos ambientais; transmissão congênita é outra possibilidade.'],
 [5,'diagnosis','Sorologia para toxoplasmose','Anticorpos são interpretados conforme o contexto e o momento da infecção.','IgM isolada não data uma infecção com segurança; a investigação de Toxoplasma pode exigir confirmação.'],
 [5, "cycle", "Taquizoíto → bradizoíto", "Multiplicação rápida precede a persistência em cistos teciduais.", "Toxoplasma também possui ciclo intestinal sexuado em felídeos."],
 [5,'prevention','Cozimento e cuidado com oocistos','Cozinhar carnes e evitar ingestão de material contaminado por oocistos de felídeos.','Na toxoplasmose, a prevenção considera tanto cistos na carne quanto oocistos do ambiente.'],
 [5,'habitat','Cistos em músculos e encéfalo','Bradizoítos podem persistir em tecidos, mesmo após o controle da fase aguda.','Toxoplasma forma cistos em diversos tecidos, incluindo músculos e sistema nervoso central.'],
 [6,'parasite','Plasmodium falciparum','Protozoário transmitido por fêmeas de mosquitos Anopheles.','É uma das espécies causadoras de malária e pode produzir doença grave.'],
 [6,'stage','Gametócito em crescente','Forma sexual sanguínea com aspecto de banana ou crescente.','Gametócitos em crescente são característicos de P. falciparum na microscopia.'],
 [6,'symptom','Febre, anemia e malária grave','Infecção de hemácias pode evoluir com manifestações cerebrais e disfunção orgânica.','P. falciparum pode causar malária grave; a febre nem sempre tem periodicidade regular.','https://www.cdc.gov/malaria/hcp/clinical-features/index.html'],
 [6,'transmission','Esporozoítos pela picada','Fêmea de Anopheles inocula esporozoítos durante o repasto sanguíneo.','Na malária, esporozoítos alcançam o fígado antes da fase que infecta hemácias.'],
 [6,'diagnosis','Gota espessa e esfregaço','Parasitos são pesquisados no sangue, incluindo formas anelares e gametócitos.','Microscopia sanguínea permite investigar malária, estimar parasitemia e auxiliar na identificação da espécie.'],
 [6, "cycle", "Gametócitos seguem para Anopheles", "O mosquito ingere formas sexuais; novos esporozoítos alcançam suas glândulas salivares.", "P. falciparum alterna multiplicação assexuada humana e fase sexuada no vetor."],
 [6,'prevention','Proteção contra Anopheles','Mosquiteiros e medidas contra picadas reduzem o contato com o vetor da malária.','A prevenção da malária inclui controle vetorial e proteção contra picadas.','https://www.cdc.gov/malaria/prevention/index.html'],
 [6,'habitat','Fígado, depois hemácias','O protozoário inicia uma fase hepática antes de invadir glóbulos vermelhos.','P. falciparum tem fases hepática e sanguínea, mas não forma hipnozoítos dormentes.'],
 [7,'parasite','Strongyloides stercoralis','Nematódeo capaz de manter autoinfecção no hospedeiro.','A autoinfecção permite que a estrongiloidíase persista por muitos anos.'],
 [7,'stage','Larva rabditoide nas fezes','Cavidade bucal curta e primórdio genital proeminente ajudam na identificação.','Na estrongiloidíase, em geral procuram-se larvas nas fezes, e não ovos como em várias outras helmintíases.'],
 [7,'symptom','Larva currens','Lesão cutânea serpiginosa que progride rapidamente, associada à autoinfecção.','Larva currens é uma manifestação característica de Strongyloides, diferente da progressão mais lenta de outras larvas cutâneas.'],
 [7,'transmission','Pele, intestino e autoinfecção','Larvas filarioides penetram a pele; parte do ciclo pode reinfectar o próprio hospedeiro.','Strongyloides combina penetração cutânea e autoinfecção, mantendo a infecção sem nova exposição ao solo.'],
 [7,'diagnosis','Pesquisa de larvas nas fezes','Métodos como Baermann ajudam a detectar larvas; uma amostra negativa não exclui a infecção.','A eliminação larvária pode ser baixa. Métodos e amostras adequados aumentam a detecção de Strongyloides.'],
 [7, "cycle", "Rabditoide → filarioide no hospedeiro", "Larvas podem tornar-se infectantes antes de sair do corpo.", "A autoinfecção interna ou perianal mantém Strongyloides por anos."],
 [7,'prevention','Calçados contra larvas do solo','Evitar contato da pele com solo contaminado reduz a entrada de larvas filarioides.','Calçados e saneamento ajudam a prevenir Strongyloides; também beneficiam a prevenção de outras parasitoses.','https://www.cdc.gov/strongyloides/about/index.html'],
 [7,'habitat','Fêmeas na mucosa do delgado','Fêmeas parasitas vivem na mucosa intestinal e dão origem a larvas.','Strongyloides ocupa a mucosa do intestino delgado, onde ocorre sua fase parasitária adulta.']
];
EXTRA_CARDS.forEach(c=>CARDS.push({id:CARDS.length,family:c[0],kind:c[1],title:c[2],description:c[3],explanation:c[4],source:c[5]||FAMILIES[c[0]].source}));
const FAMILY_NOTES=[
 'Não confunda a larva que passa pelo pulmão com o verme adulto que vive no intestino.',
 'O ovo provoca boa parte da lesão, mas quem infecta a pessoa é a cercária.',
 'A postura é perianal: isso explica a coleta por fita adesiva.',
 'O ovo tem tampões nas duas extremidades; o adulto lembra um chicote.',
 'Cisto transmite; trofozoíto adere ao intestino. Protozoários não produzem ovos de helmintos.',
 'Bradizoíto persiste; taquizoíto se multiplica rapidamente. São formas do mesmo parasito.',
 'Nem toda febre malárica segue um relógio. A espécie também importa para a gravidade.',
 'Larvas nas fezes e autoinfecção diferenciam este ciclo de muitos outros nematódeos.'
];
