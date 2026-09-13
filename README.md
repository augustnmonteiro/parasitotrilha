# Parasitotrilha

Paciência de conceitos para estudar parasitologia médica. Interface e conteúdo em português. Aplicação estática, sem dependências de execução, conta ou servidor de dados.

## Jogar e estudar

- **Mesa:** quatro coleções por partida. Selecione ou arraste ovos, formas, manifestações, transmissão, diagnóstico, ciclo, hospedeiros, prevenção e distinções ao parasito correspondente. Colunas permitem agrupar cartas e liberar as que estão fechadas.
- **Moedas:** começa com 100; associação correta sem ajuda +20; após dica +5; após correção +0; cada terceiro acerto consecutivo +10; erro −10; dica −5, gratuita nas consultas seguintes da mesma carta ou quando o saldo é de 5 moedas ou menos. Comprar e reciclar são grátis. Desfazer restaura apenas a mesa para impedir repetição de recompensas.
- **Ciclos e relações:** vinte mapas com sequência principal, ramificações e relação entre biologia, clínica e exame. O estudante reconstrói sequências com cartas embaralhadas.
- **Não confunda:** sete comparações, incluindo teníase/cisticercose, malárias, protozoários intestinais, ovos e hospedeiros.
- **Casos com cartas:** 21 situações didáticas combinam agente, forma e diagnóstico. As respostas recebem explicação; os exercícios não consomem moedas.
- **Memória:** sessões de 5, 10 ou 20 conceitos, filtráveis por coleção e tipo, sem alternativas. A resposta só aparece depois de tentar lembrar. A autoavaliação distingue esquecimento, lembrança parcial e explicação sem ajuda. O campo escrito é opcional, não é corrigido automaticamente e é salvo durante a sessão.
- **Histórico:** cartas pendentes têm prioridade, intercaladas entre coleções. Erros e respostas parciais retornam uma vez durante a sessão. Revisões lembradas em dias distintos avançam por intervalos de 1, 3, 7, 14 e 30 dias. Esquecimento retorna a 1 dia. Repetição imediata ou antecipada não promove o nível. Acerto na mesa registra prática, sem declarar retenção. O painel explicita a natureza autoavaliada do indicador.

- **Microscopia:** sete fotografias reais do CDC/PHIL, com identificação, créditos, aumento quando informado e treino de reconhecimento. Imagens externas precisam de conexão.
- **Biblioteca:** favoritos e prática das cartas filtradas; glossário e objetivos individuais no painel de estudo.

## Conteúdo

200 cartas em 20 coleções, distribuídas em cinco módulos temáticos e um desafio misto. Cada partida nova tem 40 cartas: quatro âncoras e 36 associações. Há nematódeos, trematódeos, cestódeos e protozoários intestinais, sanguíneos e teciduais. Teníase e cisticercose são conjuntos distintos porque representam caminhos e papéis do hospedeiro diferentes.

O núcleo cobre formas, ciclos, transmissão, hospedeiros, manifestações, diagnóstico e prevenção. Não pretende cobrir todas as parasitoses ou fornecer esquemas terapêuticos e posologias. Referências do CDC/DPDx e do Ministério da Saúde estão nas cartas. Conteúdo ampliado e conferido em setembro de 2026. Imunologia não integra o baralho; condições clínicas relevantes permanecem contextualizadas nas parasitoses.

Algumas cartas registram relações compartilhadas entre coleções. Essas associações são aceitas e pontuam: a carta é guardada automaticamente na coleção de origem, com explicação do vínculo compartilhado. Nos casos, alternativas compartilhadas cadastradas também são aceitas.

## Executar localmente

```sh
python3 -m http.server 4173 --directory dist
```

Abra `http://localhost:4173/`. Os arquivos em `dist/` podem ser servidos por qualquer hospedagem estática. Fontes externas são opcionais; há fontes de fallback.

## Persistência e migração

Dados ficam apenas no `localStorage` deste navegador. Não há sincronização entre dispositivos ou lembretes em segundo plano. A fila é calculada ao abrir a revisão; não é necessário manter a página aberta.

- Partida: `parasitotrilha-associacoes-v5`.
- Estudo: eventos imutáveis `parasitotrilha-evento-v2:*`, com identidade estável por conceito. O histórico v1 é importado uma vez por registro. Duas abas podem estudar simultaneamente sem sobrescrever eventos. Backup JSON exportável e importável, com união e deduplicação.
- Mesas anteriores: `parasitotrilha-partida-*`; salvas ao trocar de baralho.
- Exercício em andamento: `sessionStorage`, com retomada após recarregar a mesma aba; rascunhos incluídos. Fechar definitivamente a aba pode encerrar esse rascunho.
- Favoritos por conceito: `parasitotrilha-favorito:*`.
- Migração v3/v4 mantém saldo, mesa e associações válidas. Cartas substituídas por ciclos perdem o aprendizado antigo; se estavam concluídas, retornam ao monte. O histórico de desfazer anterior é descartado para não recuperar conteúdo substituído.
- Uma partida antiga pode manter 24 ou 32 cartas. A interface mostra o total real; novas partidas usam as 40 cartas.
- Falha de armazenamento deixa o jogo utilizável e informa que o progresso fica apenas na sessão.

## Organização

`cards.js` contém as cartas originais atualizadas; `curriculum.js`, a expansão, fontes, mapas e comparações; `engine.js`, as regras da mesa; `learning.js`, a revisão; `game.js`, o jogo e a biblioteca; `study.js`, os exercícios; `knowledge.js`, identidades, pistas sem resposta explícita, objetivos e ramificações; `tools.js`, navegação, backup e retomada; `microscopy.js`, fotografias com metadados PHIL. Os estilos estão em `style.css`, `study.css` e `ux.css`.

## Verificação

```sh
node tests/game.cjs
```

Testes com Node e DOM simulado cobrem 200 cartas, todos os módulos, 9.600 ações de mesa, moedas, grupos, dicas, vitória/derrota, relações compartilhadas, migração, vinte ciclos, 21 casos, revisão em datas simuladas e persistência após recarregamento. A checagem no navegador cobre navegação, seleção e montagem de cartas, revelação da revisão, filtros e dimensões responsivas. Arrastar nativamente não foi exercitado nesta rodada de verificação.

Quatro ferramentas WebMCP são registradas quando a API está disponível: consultar mesa, associar cartas, comprar carta e continuar após explicação. O jogo funciona sem WebMCP.
