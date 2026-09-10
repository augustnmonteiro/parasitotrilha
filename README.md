# Imunotrilha

Jogo educativo em português de parasitologia e imunologia médica. Feito com HTML, CSS e JavaScript, sem dependências de execução. Os arquivos publicados estão em `dist/`.

## Jogar localmente

Execute `python3 -m http.server 4173 --directory dist` e abra http://localhost:4173 no navegador.

## Regras

- 100 moedas fictícias iniciais e 12 cartas por partida, alternando as duas disciplinas.
- Acerto: +20. Erro: −10. Dica: −5, com duas alternativas incorretas eliminadas.
- A cada três acertos consecutivos: +10. Casas 4, 8 e 12: +10 ao responder, mesmo com erro.
- O saldo nunca fica negativo. A expedição termina após 12 respostas ou com saldo zero após uma resposta.
- Explicações com referências, biblioteca com 24 cartas e revisão de erros sem custo.
- Estado salvo localmente no navegador. Nova partida reinicia também a revisão.

## Validação

Execute `node tests/game.cjs`. Os testes usam um ambiente DOM simulado para verificar pontuação, bônus, dicas, término, estado, referências locais e ações estruturadas. Não substituem testes visuais em navegadores reais. A integração WebMCP é opcional, detectada por recurso; a validação em navegador com suporte real não foi realizada.

## Conteúdo

As referências CDC e NCBI estão disponíveis no jogo e em cada explicação. Material introdutório para estudo; não contém recomendações individuais de diagnóstico ou tratamento. As fontes externas estão em inglês.
