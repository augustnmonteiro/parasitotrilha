/* Cartas de parasitologia. IDs são permanentes para preservar o histórico local. */
const CHANGED_CARD_IDS = [5, 11, 17, 23, 37, 45, 53, 61];
const addCard = (family, kind, title, description, explanation, source) => CARDS.push({id: CARDS.length, family, kind, title, description, explanation, source: source || FAMILIES[family].source});
const baseAdditions = [
 ['Humano como hospedeiro definitivo','A lombriga adulta se reproduz no intestino humano.','O solo permite amadurecer o ovo; não é um hospedeiro intermediário.','Ovo recém-eliminado não infecta','O ovo fértil precisa embrionar no ambiente.','A transmissão da ascaridíase exige maturação ambiental.'],
 ['Biomphalaria é intermediário','Caramujo de água doce abriga etapas larvárias do trematódeo.','O humano abriga adultos sexuados; o caramujo participa obrigatoriamente do ciclo.','Espinho lateral ou terminal?','Espinho lateral proeminente aponta para S. mansoni.','S. haematobium tem espinho terminal e eliminação urinária típica.'],
 ['Ciclo direto do oxiúro','A transmissão ocorre entre pessoas, sem hospedeiro intermediário.','A contaminação das mãos sustenta o ciclo doméstico.','Fezes podem não mostrar o ovo','A fêmea deposita ovos fora do intestino, na região perianal.','A localização da postura explica por que a fita adesiva é mais útil.'],
 ['Ciclo direto do verme em chicote','O humano abriga adultos; ovos amadurecem no solo.','Não há hospedeiro intermediário obrigatório no ciclo de Trichuris.','Tampões não são filamentos','Ovo em barril com tampões polares caracteriza Trichuris.','Hymenolepis nana apresenta filamentos polares; são estruturas diferentes.'],
 ['Transmissão sem vetor','O flagelado intestinal circula por via fecal-oral.','Água contaminada conecta a eliminação de cistos à nova ingestão.','Má absorção sem invasão habitual','O trofozoíto com disco adesivo ocupa a superfície do delgado.','Diferencie da amebíase invasiva do cólon; sintomas isolados não bastam.'],
 ['Felídeo é hospedeiro definitivo','É no intestino de felídeos que ocorre reprodução sexuada.','Humanos funcionam como hospedeiros intermediários de Toxoplasma.','Oocisto precisa esporular','Oocistos eliminados por felídeos amadurecem no ambiente.','Não confunda oocisto ambiental com cisto de bradizoítos na carne.'],
 ['Anopheles é definitivo','A fecundação ocorre no mosquito vetor da malária.','Na malária, o humano é intermediário; o vetor também é hospedeiro.','Sem hipnozoítos hepáticos','Esta espécie não mantém a forma hepática dormente típica de vivax.','Recorrência de P. falciparum não é recaída por hipnozoítos.'],
 ['Vida livre e vida parasitária','O nematódeo alterna gerações ambientais com fêmeas parasitas humanas.','Esse ciclo permite desenvolvimento no solo e autoinfecção no humano.','Larvas, não ovos, na rotina','Na amostra fecal habitual de estrongiloidíase, busque larvas.','Ancilostomídeos humanos geralmente eliminam ovos; a amostra importa.']
];
baseAdditions.forEach((a, f) => { addCard(f,'host',...a.slice(0,3)); addCard(f,'pitfall',...a.slice(3)); });

// Para novos conjuntos: forma, transmissão, local, manifestação, diagnóstico,
// prevenção, ciclo, hospedeiro e distinção. Cada conjunto tem dez cartas.
const EXPANSION = [
 {name:'Ancilostomídeos humanos',short:'Ancilostomídeos',disease:'Ancilostomíase',group:'Nematódeos',ref:'hookworm',about:'https://www.cdc.gov/sth/about/hookworm.html',intro:'Ancylostoma duodenale e Necator americanus; vermes intestinais hematófagos.',note:'Ovo sai nas fezes; larva filarioide infecta pela pele. A perda de sangue explica a anemia.',cards:[
 ['egg','Ovo fino e segmentado','Casca fina, formato oval e embrião segmentado.','Ovos de Ancylostoma e Necator são muito semelhantes.'],
 ['transmission','Filarioide entra pelo pé','Larva do solo penetra a pele e migra pelo pulmão.','A. duodenale também pode ser adquirido por ingestão de larvas.'],
 ['habitat','Adultos hematófagos no delgado','Vermes fixados à mucosa retiram sangue.','A fixação mantém perda intestinal de sangue.'],
 ['symptom','Anemia por perda intestinal','Infecção intensa por vermes hematófagos pode causar deficiência de ferro.','Anemia não é um diagnóstico etiológico isolado.'],
 ['diagnosis','Ovos de ancilostomídeos nas fezes','Microscopia procura ovos ovais de casca fina.','O ovo isolado não diferencia as principais espécies.'],
 ['prevention','Proteger os pés e sanear','Calçados reduzem exposição às larvas de vermes hematófagos.','Saneamento diminui contaminação fecal do solo.'],
 ['cycle','Solo → pele → pulmão → delgado','Ovos eclodem no solo; larvas infectantes alcançam humanos.','Adultos intestinais produzem ovos eliminados nas fezes.'],
 ['host','Humano com vermes hematófagos','O ciclo de Necator não exige hospedeiro intermediário.','As larvas se desenvolvem no ambiente.'],
 ['pitfall','Ancilostomíase não é larva currens','Adultos intestinais e ovos fecais caracterizam este conjunto.','Larva currens aponta para autoinfecção por Strongyloides.']
 ]},
 {name:'Entamoeba histolytica',short:'Entamoeba',disease:'Amebíase',group:'Protozoários intestinais',ref:'amebiasis',about:'https://www.cdc.gov/amebiasis/about/index.html',intro:'Ameba capaz de invadir o cólon e alcançar o fígado.',note:'O cisto transmite; o trofozoíto pode invadir. Microscopia isolada não separa bem E. histolytica de E. dispar.',cards:[
 ['stage','Cisto amebiano maduro','Cisto geralmente esférico com quatro núcleos na maturidade.','Quatro núcleos também ocorrem em Giardia; avalie a morfologia completa.'],
 ['transmission','Cistos maduros da ameba ingeridos','Água, alimentos ou mãos contaminadas transportam cistos.','Trofozoítos são frágeis no ambiente.'],
 ['habitat','Cólon, com possível invasão hepática','Trofozoítos podem atravessar a mucosa colônica.','Disseminação portal pode levar ao fígado.'],
 ['symptom','Disenteria e abscesso hepático','A amebíase invasiva pode produzir sangue nas fezes.','Muitas infecções permanecem sem manifestações.'],
 ['diagnosis','Distinguir histolytica de dispar','Testes moleculares ou antígenos específicos ajudam na diferenciação.','A microscopia de cistos não resolve essa distinção.'],
 ['prevention','Higiene contra cistos amebianos','Água segura e lavagem das mãos interrompem a via fecal-oral.','Portadores podem eliminar cistos sem sintomas.'],
 ['cycle','Desencistamento e colonização colônica','Cistos ingeridos liberam trofozoítos que alcançam o cólon.','Novos cistos são eliminados; alguns trofozoítos invadem tecidos.'],
 ['host','Portador humano elimina cistos','Pessoas assintomáticas podem manter transmissão da ameba.','Não há vetor obrigatório.'],
 ['pitfall','Nem toda Entamoeba é histolytica','Amebas semelhantes podem ser não patogênicas.','Não atribua doença invasiva apenas ao aspecto de um cisto.']
 ]},
 {name:'Taenia spp. · adulto',short:'Taenia adulta',disease:'Teníase',group:'Cestódeos',ref:'taeniasis',about:'https://www.cdc.gov/taeniasis/about/index.html',intro:'T. saginata e T. solium adultas vivem no intestino humano.',note:'Cisticerco na carne → teníase. Ovo de T. solium ingerido → cisticercose.',cards:[
 ['stage','Cisticerco na carne','Forma larvária em carne bovina ou suína.','Quando ingerido viável, pode originar a tênia adulta.'],
 ['transmission','Carne com cisticercos viáveis','Carne insuficientemente cozida transmite a infecção intestinal por tênia.','T. saginata associa-se a bovinos; T. solium, a suínos.'],
 ['habitat','Tênia adulta no intestino delgado','Escólex fixado e corpo dividido em proglotes.','Teníase é a infecção pelo adulto intestinal.'],
 ['symptom','Eliminação de proglotes','Segmentos do verme podem aparecer nas fezes.','A teníase frequentemente tem sintomas leves ou ausentes.'],
 ['diagnosis','Ovos ou proglotes nas fezes','Pesquisa fecal identifica a infecção intestinal.','Proglotes ou escólex ajudam a definir a espécie.'],
 ['prevention','Cozimento adequado da carne','Interrompe a ingestão de cisticercos viáveis.','Inspeção de carnes e saneamento complementam a prevenção.'],
 ['cycle','Cisticerco ingerido → adulto','Adultos liberam ovos; bovinos ou suínos ingerem esses ovos.','O ciclo volta à carne com cisticercos.'],
 ['host','Humano definitivo; animal intermediário','O humano abriga o adulto sexuado da tênia.','Bovinos ou suínos abrigam cisticercos.'],
 ['pitfall','Ovo de Taenia não define espécie','Ovos de T. solium e T. saginata são indistinguíveis à microscopia usual.','Não conclua a espécie apenas pelo ovo.']
 ]},
 {name:'Taenia solium · larva',short:'T. solium larva',disease:'Cisticercose',group:'Cestódeos',ref:'cysticercosis',about:'https://www.cdc.gov/cysticercosis/about/index.html',intro:'Infecção tecidual pelo cisticerco de T. solium.',note:'A origem dos ovos é uma pessoa com teníase por T. solium. Cisticercose não exige comer carne suína.',cards:[
 ['egg','Ovo de T. solium ingerido','Forma que inicia cisticercose no humano.','A origem é fecal, a partir de um portador da tênia adulta.'],
 ['transmission','Ovos por via fecal-oral','Água, alimentos ou mãos contaminadas podem levar ovos à boca.','Comer cisticercos na carne causa teníase.'],
 ['habitat','Cisticercos nos tecidos','Larvas podem alojar-se no sistema nervoso e em músculos.','A localização determina as manifestações.'],
 ['symptom','Crises epilépticas na neurocisticercose','Cisticercos no sistema nervoso podem causar manifestações neurológicas.','O quadro depende de número, estágio e localização das lesões.'],
 ['diagnosis','Neuroimagem e testes específicos','TC ou RM e sorologia ajudam na investigação.','Exame de fezes não diagnostica cisticercos cerebrais.'],
 ['prevention','Interromper contaminação por ovos','Saneamento, mãos limpas e cuidado com portadores de teníase.','A prevenção visa ovos de origem humana.'],
 ['cycle','Oncosfera → tecidos → cisticerco','Ovo ingerido libera oncosfera, que atravessa o intestino.','A circulação leva a forma larvária aos tecidos.'],
 ['host','Humano intermediário acidental','Na cisticercose, o humano abriga larvas de T. solium.','Na teníase, o mesmo humano é definitivo.'],
 ['pitfall','Pode ocorrer sem consumo de porco','A exposição relevante é a ingestão de ovos de T. solium.','Carne com cisticercos e alimento com ovos geram doenças distintas.']
 ]},
 {name:'Trypanosoma cruzi',short:'T. cruzi',disease:'Doença de Chagas',group:'Protozoários teciduais',ref:'trypanosomiasisamerican',about:'https://www.cdc.gov/chagas/about/index.html',intro:'Protozoário com amastigotas teciduais e tripomastigotas sanguíneos.',note:'Na via vetorial, o parasito vem das fezes do barbeiro. A fase clínica orienta o método diagnóstico.',cards:[
 ['stage','Tripomastigota sanguíneo de T. cruzi','Forma circulante com cinetoplasto evidente.','Multiplicação humana ocorre principalmente como amastigota intracelular.'],
 ['transmission','Fezes do barbeiro na porta de entrada','Parasitos alcançam pele lesada ou mucosa.','Também existem transmissão oral e congênita.'],
 ['habitat','Amastigotas dentro de células','Formas teciduais podem acometer o miocárdio.','Tripomastigotas circulam e invadem novas células.'],
 ['symptom','Cardiopatia e megavísceras','Doença crônica pode causar arritmias, megaesôfago ou megacólon.','Muitas pessoas permanecem na forma indeterminada.'],
 ['diagnosis','Chagas: método depende da fase','Pesquisa direta é útil na fase aguda; sorologia na crônica.','Na fase crônica, usam-se testes sorológicos distintos para confirmação.'],
 ['prevention','Controle de triatomíneos e alimentos','Melhoria habitacional e segurança alimentar reduzem exposições.','A transmissão oral exige atenção além do controle do vetor.'],
 ['cycle','Amastigota → tripomastigota','Multiplicação intracelular precede liberação ao sangue.','No barbeiro, ocorre desenvolvimento até formas metacíclicas infectantes.'],
 ['host','Triatomíneo e mamíferos','Barbeiros são vetores; vários mamíferos participam como reservatórios.','T. cruzi mantém ciclos silvestres e domésticos.'],
 ['pitfall','Fezes do vetor, não saliva','A via clássica envolve contaminação da lesão ou mucosa.','Diferencie da inoculação pela picada na malária e leishmaniose.']
 ]},
 {name:'Leishmania infantum',short:'L. infantum',disease:'Leishmaniose visceral',group:'Protozoários teciduais',ref:'leishmaniasis',about:'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/l/leishmaniose-visceral',intro:'Agente da leishmaniose visceral no Brasil; também chamado L. chagasi.',note:'Febre prolongada e hepatoesplenomegalia compõem o padrão visceral. O cão é reservatório; o flebotomíneo é vetor.',cards:[
 ['stage','Amastigotas em órgãos viscerais','Formas pequenas com núcleo e cinetoplasto, dentro de células.','A morfologia isolada não identifica a espécie de Leishmania.'],
 ['transmission','Picada do vetor do calazar','Flebotomíneo infectado inocula promastigotas.','Contato direto com o cão não é a via vetorial.'],
 ['habitat','Baço, fígado e medula óssea','A forma visceral acomete órgãos do sistema fagocítico.','A distribuição ajuda a entender o quadro sistêmico.'],
 ['symptom','Febre prolongada e baço aumentado','Perda de peso e anemia podem acompanhar a forma visceral.','Hepatoesplenomegalia orienta a suspeita, sem confirmar sozinha.'],
 ['diagnosis','Pesquisa parasitária na forma visceral','Material de medula óssea pode revelar amastigotas.','Testes sorológicos também integram a investigação contextualizada.'],
 ['prevention','Reduzir picadas do vetor visceral','Proteção pessoal e manejo ambiental reduzem contato com flebotomíneos.','Prevenção integra ações sobre vetor e reservatórios.'],
 ['cycle','Promastigota → amastigota visceral','Forma inoculada transforma-se e multiplica-se em células do hospedeiro.','O vetor ingere células infectadas durante o repasto.'],
 ['host','Cão reservatório; flebotomíneo vetor','O cão tem importância no ciclo urbano da forma visceral.','Reservatório e vetor exercem papéis diferentes.'],
 ['pitfall','Calazar não é a úlcera cutânea típica','O padrão de L. infantum é visceral e sistêmico.','Outras leishmânias estão associadas às formas tegumentares.']
 ]},
 {name:'Leishmania braziliensis',short:'L. braziliensis',disease:'Leishmaniose tegumentar',group:'Protozoários teciduais',ref:'leishmaniasis',about:'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/l/lt',intro:'Espécie associada a lesões cutâneas e possível acometimento mucoso.',note:'A lesão mucosa pode surgir após a cutânea. Nem toda leishmaniose tegumentar é causada por L. braziliensis.',cards:[
 ['stage','Amastigotas na lesão cutânea','Formas intracelulares pesquisadas em tecido da lesão.','A espécie exige métodos além da morfologia usual.'],
 ['transmission','Promastigotas pela picada na pele','Flebotomíneos transmitem formas que iniciam infecção tegumentar.','Vetor e forma infectante são compartilhados com outras leishmanioses.'],
 ['habitat','Pele e possível mucosa','A doença pode comprometer mucosas nasal e oral.','Acometimento mucoso pode ser tardio.'],
 ['symptom','Úlcera com bordas elevadas','Lesão cutânea frequentemente indolor pode ocorrer na leishmaniose.','Aspecto clínico sozinho não confirma etiologia.'],
 ['diagnosis','Amostra da lesão para investigar Leishmania','Pesquisa parasitária e testes moleculares podem auxiliar.','Identificar a espécie pode ser relevante ao risco mucoso.'],
 ['prevention','Proteção contra flebotomíneos na mata','Roupas protetoras e medidas contra picadas reduzem exposição.','A prevenção considera o ambiente de transmissão.'],
 ['cycle','Amastigotas teciduais → vetor','O vetor ingere células infectadas da pele.','Promastigotas desenvolvem-se no inseto e voltam ao hospedeiro.'],
 ['host','Ciclo tegumentar com mamíferos','Reservatórios variam conforme a espécie e a região.','Não generalize o papel do cão no calazar a todo ciclo tegumentar.'],
 ['pitfall','Cutânea não significa sempre localizada','L. braziliensis pode associar-se a doença mucosa.','Uma lesão cicatrizada não elimina essa possibilidade.']
 ]},
 {name:'Plasmodium vivax',short:'P. vivax',disease:'Malária por vivax',group:'Protozoários sanguíneos',ref:'malaria',about:'https://www.cdc.gov/malaria/about/index.html',intro:'Espécie de malária com formas hepáticas dormentes e possibilidade de recaídas.',note:'Hipnozoíto fica no fígado; formas sanguíneas causam os sintomas. Vivax também pode causar doença grave.',cards:[
 ['stage','Hipnozoíto hepático','Forma dormente que pode reiniciar a fase sanguínea.','P. vivax e P. ovale podem formar hipnozoítos.'],
 ['transmission','Anopheles inicia a malária com recaídas','Esporozoítos inoculados alcançam o fígado.','A recaída por hipnozoítos dispensa uma nova picada.'],
 ['habitat','Fígado dormente e reticulócitos','P. vivax tem preferência por hemácias jovens.','Fase hepática e sanguínea são alvos conceitualmente distintos.'],
 ['symptom','Novo episódio sem nova picada','Hipnozoítos podem reativar após o episódio inicial.','Nem toda recorrência de malária é recaída.'],
 ['diagnosis','Hemácias aumentadas e granulações','Esfregaço pode mostrar alterações típicas de vivax.','Gota espessa detecta parasitos; espécie exige avaliação morfológica.'],
 ['prevention','Evitar novas picadas de Anopheles','Mosquiteiros e proteção pessoal reduzem novas infecções.','Proteção vetorial não remove hipnozoítos já presentes.'],
 ['cycle','Fase hepática com ramo dormente','Parte das formas pode permanecer como hipnozoíto.','Merozoítos iniciam a multiplicação nas hemácias.'],
 ['host','Anopheles no ciclo de vivax','Reprodução sexuada ocorre no mosquito.','Humano é intermediário; mosquito é definitivo e vetor.'],
 ['pitfall','Vivax não é sinônimo de benigno','Apesar da associação clássica a recaídas, pode haver doença grave.','Não use a espécie isolada para descartar gravidade.']
 ]},
 {name:'Cryptosporidium spp.',short:'Cryptosporidium',disease:'Criptosporidiose',group:'Protozoários intestinais',ref:'cryptosporidiosis',about:'https://www.cdc.gov/cryptosporidium/about/index.html',intro:'Protozoário intestinal com oocistos pequenos e transmissão fecal-oral.',note:'Oocistos já saem infectantes. A resistência ao cloro facilita surtos associados à água.',cards:[
 ['stage','Oocisto pequeno acidorresistente','Oocisto arredondado, em torno de 4–6 micrômetros.','Colorações específicas auxiliam sua identificação.'],
 ['transmission','Oocistos infectantes na água','Ingestão de água contaminada pode causar criptosporidiose.','Contato com pessoas e animais também pode transmitir.'],
 ['habitat','Borda em escova intestinal','O parasito ocupa a superfície apical dos enterócitos.','A localização se relaciona ao quadro diarreico.'],
 ['symptom','Diarreia aquosa por oocistos','Pode ser prolongada e grave em pessoas com defesa comprometida.','Desidratação é uma consequência possível.'],
 ['diagnosis','Pesquisar oocistos de Cryptosporidium','Coloração acidorresistente, antígeno ou PCR são opções.','O exame parasitológico habitual pode precisar de método específico.'],
 ['prevention','Cloro habitual não basta','Oocistos resistem à cloração usual de piscinas.','Evitar engolir água e garantir tratamento adequado reduz o risco.'],
 ['cycle','Oocisto já sai esporulado','Esporozoítos infectam enterócitos; multiplicação gera novos oocistos.','Oocistos de parede fina podem manter autoinfecção.'],
 ['host','Pessoas e animais no ciclo','C. hominis e C. parvum têm importância humana.','A participação animal varia entre espécies.'],
 ['pitfall','Cisto de Giardia ou oocisto?','Cryptosporidium tem oocisto pequeno; Giardia tem cisto oval maior.','A forma e o método de detecção ajudam a separar as hipóteses.']
 ]},
 {name:'Wuchereria bancrofti',short:'Wuchereria',disease:'Filariose linfática',group:'Nematódeos',ref:'lymphaticfilariasis',about:'https://www.cdc.gov/filarial-worms/about/lymphatic-filariasis.html',intro:'Nematódeo com adultos linfáticos e microfilárias sanguíneas.',note:'Adulto no vaso linfático; microfilária no sangue. O horário da coleta pode importar.',cards:[
 ['stage','Microfilária com bainha','Cauda afilada sem núcleos até a ponta.','A morfologia ajuda a distinguir filárias.'],
 ['transmission','Larva L3 entregue pelo mosquito','A larva infectante penetra pela lesão da picada.','Microfilárias são ingeridas pelo vetor, não a forma que ele transmite.'],
 ['habitat','Adultos nos vasos linfáticos','Vermes adultos ocupam o sistema linfático.','Microfilárias circulam no sangue periférico.'],
 ['symptom','Linfedema e hidrocele','Comprometimento linfático crônico pode causar grande aumento de volume.','Nem toda pessoa infectada apresenta elefantíase.'],
 ['diagnosis','Sangue no horário da microfilaremia','A periodicidade costuma ser noturna.','Testes de antígeno são outra opção para W. bancrofti.'],
 ['prevention','Reduzir transmissão por mosquitos','Controle vetorial e proteção contra picadas interrompem novas infecções.','Ações coletivas integram o controle da filariose.'],
 ['cycle','Microfilária → mosquito → L3','Desenvolvimento no mosquito gera larvas infectantes.','No humano, amadurecem em vermes linfáticos.'],
 ['host','Humano definitivo; mosquito intermediário','O mosquito abriga desenvolvimento larvário e atua como vetor.','É diferente da classificação dos hospedeiros na malária.'],
 ['pitfall','Elefantíase não identifica a causa','Linfedema tem causas infecciosas e não infecciosas.','Confirmação etiológica exige investigação adequada.']
 ]},
 {name:'Echinococcus granulosus s.l.',short:'Echinococcus',disease:'Equinococose cística',group:'Cestódeos',ref:'echinococcosis',about:'https://www.cdc.gov/echinococcosis/about/about-cystic-echinococcosis-ce.html',intro:'Cestódeo cuja larva produz cisto hidático em hospedeiros intermediários.',note:'Cão com adulto elimina ovos; humano abriga cistos. Não se espera tênia adulta humana neste ciclo.',cards:[
 ['stage','Cisto hidático com protoescólices','Estrutura larvária pode conter vesículas-filhas.','É a forma tecidual da equinococose cística.'],
 ['transmission','Ovos de origem canina ingeridos','Fezes de cães infectados podem contaminar mãos e alimentos.','Humanos tornam-se intermediários acidentais.'],
 ['habitat','Cistos sobretudo em fígado e pulmões','O crescimento pode ser lento durante anos.','O verme adulto habita o intestino de canídeos.'],
 ['symptom','Efeito de massa do cisto','Crescimento pode causar desconforto abdominal ou torácico.','Ruptura pode gerar reação grave e disseminação.'],
 ['diagnosis','Imagem do cisto e sorologia','Ultrassonografia ou outros exames de imagem orientam a avaliação.','Sorologia negativa não exclui todos os casos.'],
 ['prevention','Não oferecer vísceras cruas a cães','Evita que o cão ingira a forma larvária infectante.','Higiene e controle veterinário reduzem exposição humana a ovos.'],
 ['cycle','Cão → ovos → cisto em herbívoro','Canídeos se infectam ao ingerir vísceras com cistos.','Humanos entram acidentalmente na etapa intermediária.'],
 ['host','Canídeo definitivo; humano acidental','Cães abrigam adultos; herbívoros participam como intermediários.','O humano não é o hospedeiro definitivo usual.'],
 ['pitfall','Cisto tecidual não produz ovos fecais','O humano abriga larvas, não a tênia adulta.','Exame de fezes humano não é a investigação do cisto hidático.']
 ]},
 {name:'Hymenolepis nana',short:'H. nana',disease:'Himenolepíase',group:'Cestódeos',ref:'hymenolepiasis',about:'https://www.cdc.gov/hymenolepis/about/index.html',intro:'Tênia anã capaz de ciclo direto e autoinfecção interna.',note:'É um cestódeo que pode dispensar intermediário. Filamentos polares diferenciam seu ovo.',cards:[
 ['egg','Ovo com filamentos polares','Oncosfera com seis ganchos e filamentos entre membranas.','H. diminuta não apresenta esses filamentos.'],
 ['transmission','Ovos infectantes da tênia anã','Mãos, água ou alimentos podem levar ovos à boca.','Também existe via com artrópode contendo cisticercoide.'],
 ['habitat','Tênia anã no íleo','Adultos vivem na porção distal do delgado.','A fase larvária passa pelas vilosidades.'],
 ['symptom','Carga elevada e sintomas intestinais','Infecção intensa pode causar dor abdominal e diarreia.','Muitas infecções leves são assintomáticas.'],
 ['diagnosis','Filamentos polares no exame fecal','Microscopia identifica ovos característicos da tênia anã.','A morfologia diferencia H. nana de outros cestódeos.'],
 ['prevention','Higiene contra ovos da tênia anã','Lavagem das mãos e alimentos reduz a via fecal-oral.','Controle de roedores e insetos também é relevante.'],
 ['cycle','Oncosfera → cisticercoide → adulto','A larva desenvolve-se na vilosidade e retorna à luz.','Autoinfecção interna pode prolongar a infecção.'],
 ['host','Intermediário não é obrigatório','H. nana consegue completar o ciclo em um hospedeiro.','Artrópodes podem atuar como intermediários facultativos.'],
 ['pitfall','Filamentos não são tampões polares','H. nana tem filamentos; Trichuris tem tampões.','Ovos semelhantes exigem leitura da estrutura completa.']
 ]}
];
EXPANSION.forEach(item => {
 const f = FAMILIES.length;
 FAMILIES.push({...item, source:`https://www.cdc.gov/dpdx/${item.ref}/index.html`});
 FAMILY_NOTES.push(item.note);
 addCard(f,'parasite',item.name,item.intro,`Coleção de ${item.disease.toLowerCase()}. Compare forma infectante, localização e forma diagnóstica.`);
 item.cards.forEach(([kind,title,description,explanation]) => addCard(f,kind,title,description,explanation,['symptom','prevention','pitfall'].includes(kind)?item.about:undefined));
});
['Nematódeos','Trematódeos','Nematódeos','Nematódeos','Protozoários intestinais','Protozoários teciduais','Protozoários sanguíneos','Nematódeos'].forEach((g,i) => FAMILIES[i].group=g);

const DECKS = {
 helmintos:{title:'01 · Ovos e caminhos',description:'Morfologia, migração e coleta de amostras.',families:[0,1,2,3]},
 intestino:{title:'02 · Diarreia em contexto',description:'Má absorção, invasão, oocistos e larvas.',families:[4,9,16,7]},
 cestodeos:{title:'03 · Ovos ou carne?',description:'Teníase, cisticercose e outros cestódeos.',families:[10,11,18,19]},
 vetores:{title:'04 · Quem transmite o quê?',description:'Chagas, leishmanioses e filariose.',families:[12,13,14,17]},
 diversidade:{title:'05 · Do solo aos tecidos',description:'Ancilostomídeos, Toxoplasma e duas malárias.',families:[8,5,6,15]},
 misto:{title:'Desafio misto',description:'Quatro coleções sorteadas entre as vinte.',families:null}
};

// Relações válidas compartilhadas não devem gerar punição na mesa.
const shared = (families, kinds) => families.forEach(f => CARDS.filter(c=>c.family===f&&kinds.includes(c.kind)).forEach(c=>c.related=[...new Set([...(c.related||[]),...families.filter(n=>n!==f)])]));
shared([6,15],['transmission','prevention','host']);
shared([13,14],['transmission']);
shared([7,8],['prevention']);
// Algumas pistas são amplas, mas outras no mesmo tipo distinguem a espécie.
CARDS[52].related=[15]; // Gota espessa e esfregaço.
CARDS[55].related=[15]; // Fígado, depois hemácias.
CARDS[5].related=[7,8]; // A descrição da passagem pulmonar é compartilhada.
CARDS.find(c=>c.family===8&&c.kind==='transmission').related=[7];

const CYCLES = [
 ['Ovos nas fezes','Embrionamento no solo','Ingestão de ovo infectante','Migração pulmonar','Adulto no delgado'],
 ['Ovos chegam à água','Miracídio entra no caramujo','Caramujo libera cercárias','Cercária penetra a pele','Adultos nos vasos mesentéricos'],
 ['Adultos no ceco','Fêmea migra à região perianal','Postura e maturação dos ovos','Ovos chegam à boca','Larvas e adultos intestinais'],
 ['Ovos nas fezes','Embrionamento no solo','Ingestão do ovo','Eclosão no intestino','Adulto no ceco e cólon'],
 ['Cistos nas fezes','Ingestão de cistos','Desencistamento no delgado','Trofozoítos aderem e multiplicam','Encistamento'],
 ['Oocisto esporulado ou cisto na carne','Ingestão pelo humano','Multiplicação de taquizoítos','Disseminação tecidual','Cistos com bradizoítos'],
 ['Anopheles inocula esporozoítos','Multiplicação hepática','Merozoítos infectam hemácias','Gametócitos no sangue','Mosquito ingere gametócitos'],
 ['Larva filarioide penetra a pele','Migração pulmonar','Fêmeas na mucosa do delgado','Larvas rabditoides','Saída fecal ou autoinfecção'],
 ['Ovos nas fezes','Larvas desenvolvem-se no solo','Filarioide penetra a pele','Migração pulmonar','Adultos hematófagos no delgado'],
 ['Ingestão do cisto maduro','Desencistamento no delgado','Trofozoítos no cólon','Multiplicação e encistamento','Cistos saem nas fezes'],
 ['Humano elimina ovos de Taenia','Animal ingere ovos','Cisticercos na carne','Humano ingere cisticercos','Tênia adulta no delgado'],
 ['Portador de T. solium elimina ovos','Humano ingere ovos','Oncosfera atravessa o intestino','Disseminação pela circulação','Cisticercos nos tecidos'],
 ['Fezes do barbeiro contaminam lesão','Tripomastigotas entram nas células','Amastigotas multiplicam-se','Tripomastigotas no sangue','Barbeiro ingere parasitos'],
 ['Flebotomíneo inocula promastigotas','Entrada em células fagocíticas','Amastigotas em órgãos viscerais','Vetor ingere células infectadas','Promastigotas no vetor'],
 ['Flebotomíneo inocula promastigotas','Entrada em células da pele','Multiplicação de amastigotas','Vetor ingere células infectadas','Promastigotas no vetor'],
 ['Anopheles inocula esporozoítos','Fase hepática e possível dormência','Merozoítos infectam reticulócitos','Gametócitos no sangue','Mosquito ingere gametócitos'],
 ['Oocistos já infectantes nas fezes','Ingestão de oocistos','Esporozoítos alcançam enterócitos','Multiplicação assexuada e sexuada','Produção de oocistos'],
 ['Mosquito transmite larva L3','Adultos nos vasos linfáticos','Microfilárias no sangue','Mosquito ingere microfilárias','Larvas desenvolvem-se até L3'],
 ['Canídeo elimina ovos','Intermediário ingere ovos','Oncosferas alcançam órgãos','Cistos hidáticos nas vísceras','Canídeo ingere vísceras infectadas'],
 ['Ingestão de ovos de H. nana','Oncosfera entra na vilosidade','Cisticercoide na vilosidade','Adulto na luz do íleo','Ovos saem ou geram autoinfecção']
];
const CYCLE_NOTES = {
 5:'Este trajeto mostra a infecção humana. Nos felídeos ocorre o ciclo sexuado; também pode haver transmissão congênita.',
 7:'A bifurcação é essencial: larvas podem seguir ao ambiente ou reinfectar o próprio humano.',
 9:'Além do caminho luminal, trofozoítos podem invadir tecidos e alcançar o fígado.',
 11:'Esta sequência termina na forma larvária humana; a teníase adulta é outro caminho do mesmo parasito.',
 12:'O trajeto mostrado é vetorial. A transmissão oral e a congênita também importam.',
 15:'Hipnozoítos podem retomar a fase sanguínea. Esse ramo de recaída não exige nova picada.',
 18:'No humano acidental, o trajeto normalmente termina nos cistos; o ciclo habitual envolve canídeos e animais intermediários.'
};
const RELATIONS = [
 'A passagem da larva pelo pulmão antecede o adulto intestinal; a fase explica por que sintomas e exames podem variar no tempo.',
 'O adulto vive em vasos, mas os ovos atravessam tecidos: isso conecta eliminação fecal e lesão hepática.',
 'Postura perianal à noite → prurido noturno → fita adesiva pela manhã.',
 'Fixação no cólon → lesão intestinal em carga intensa → ovos com tampões nas fezes.',
 'Adesão no delgado → alteração da absorção → diarreia; o cisto resistente permite chegar ao próximo hospedeiro.',
 'Cistos persistentes nos tecidos → possibilidade de reativação; carne com cistos e ambiente com oocistos são exposições diferentes.',
 'A fase sanguínea conecta parasitos no esfregaço, anemia e manifestações clínicas; o mosquito mantém a transmissão.',
 'Autoinfecção → persistência por anos; eliminação larvária variável → uma amostra negativa pode não excluir a infecção.',
 'Adultos retiram sangue da mucosa → perda crônica de ferro → anemia em infecções intensas.',
 'Invasão do cólon → disenteria; acesso à circulação portal → possível abscesso hepático.',
 'Ingestão de larva na carne → verme adulto intestinal → ovos e proglotes no exame de fezes.',
 'Ingestão de ovo → larva tecidual; por isso a investigação de neurocisticercose depende de imagem e contexto, não de ovos nas fezes.',
 'Parasitemia e fase clínica mudam ao longo do tempo → o método diagnóstico da fase aguda difere do usado na crônica.',
 'Acometimento visceral → aumento de baço e fígado e alterações sanguíneas; amostra tecidual pode demonstrar o parasito.',
 'Parasito no tecido cutâneo → amostra da lesão; risco de acometimento mucoso depende também da espécie.',
 'Forma dormente hepática → recaída sem reinfecção; a gota espessa investiga o sangue, não mostra hipnozoítos.',
 'Oocisto já infectante e resistente no ambiente → transmissão hídrica; localização intestinal → diarreia.',
 'Adultos linfáticos → dano linfático; microfilárias sanguíneas → coleta de sangue orientada pela periodicidade.',
 'Humano com larva tecidual → cisto visto em imagem; cão com adulto → ovos que contaminam o ambiente.',
 'Ciclo direto e autoinfecção → infecção persistente; filamentos polares no ovo ajudam a reconhecer a espécie.'
];
const COMPARISONS = [
 {title:'Teníase × cisticercose',families:[10,11],key:'A forma ingerida muda o papel do humano e o local da doença.'},
 {title:'Larvas que entram pela pele',families:[7,8,1],key:'Solo com filarioides e água com cercárias são exposições diferentes.'},
 {title:'Diarreia por protozoários',families:[4,9,16],key:'Relacione forma, local de colonização, invasão e método diagnóstico.'},
 {title:'As duas malárias',families:[6,15],key:'Vetor e várias fases são compartilhados; hipnozoítos e morfologia distinguem as espécies.'},
 {title:'Chagas × leishmanioses',families:[12,13,14],key:'Compare a porta de entrada, o vetor e o tecido acometido.'},
 {title:'Ovos que confundem',families:[2,3,19],key:'Face achatada, tampões e filamentos polares não são a mesma estrutura.'},
 {title:'Quem é o hospedeiro definitivo?',families:[5,6,17,18],key:'É quem abriga a reprodução sexuada ou o adulto sexuado; nem sempre é o humano.'}
];
const RECALL_PROMPTS = {
 egg:'Descreva a morfologia do ovo e diga como ela ajuda a diferenciá-lo.',
 stage:'Qual forma caracteriza este conjunto? Onde ela está e qual é seu papel?',
 transmission:'Qual forma infecta o humano e por qual via ela entra?',
 habitat:'Onde o parasito fica no humano? Diferencie adulto e larva, quando houver.',
 symptom:'Que manifestação é importante e como ela se relaciona à localização ou ao ciclo?',
 diagnosis:'Qual amostra ou método você escolheria? Qual limitação precisa lembrar?',
 prevention:'Que etapa da transmissão esta medida preventiva interrompe?',
 cycle:'Reconstrua o caminho do parasito e explique a etapa destacada.',
 host:'Quais hospedeiros ou vetores participam? Qual é o papel de cada um?',
 pitfall:'Qual confusão importante você precisa evitar neste conjunto?'
};

CARDS.find(c=>c.family===15&&c.kind==='pitfall').source='https://www.cdc.gov/malaria/hcp/clinical-guidance/treatment-of-uncomplicated-malaria.html';
