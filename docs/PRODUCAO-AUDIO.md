# Produção dos áudios

Material de produção. Fica fora de `src/`, portanto não é empacotado.

Os áudios são **opcionais**. A transcrição cronometrada em
`src/content/act3.ts` é a fonte oficial do conteúdo e sempre aparece na tela.
Se um arquivo de som existir, ele toca junto; se não existir, o jogo segue
normalmente com a transcrição.

Para usar: salve como `public/assets/audio/<ID>.m4a`.

| ID | Arquivo no jogo | Duração | Quem fala | Tom |
|---|---|---|---|---|
| VOICE_001 | `pauta_documentario.m4a` | 3:10 | Clara, sozinha | Alegre, acelerada, rindo de si mesma. É a voz "antes". |
| VOICE_002 | `_.m4a` | 4:51 | Clara, sozinha | Monólogo noturno. Voz baixa, pausas longas, sem choro aberto. |
| VOICE_003 | `pra eles.m4a` | 7:02 | Clara, sozinha | Carta falada, endereçada a outra pessoa. Formal no começo, quebrando aos poucos. |
| VOICE_004 | `gravacao_080326_1946.m4a` | 6:12 | Duas mulheres, externa | Vento constante, cascalho, porta de carro. Nada de trilha. |

## Notas de direção

**VOICE_001** precisa soar como alguém que grava por hábito, não por
necessidade. O riso no meio é importante: é o que faz o retorno dessa mesma
gravação, no fim do jogo, doer.

**VOICE_002** não deve ser chorada. É alguém já muito além do choro, contando
uma coisa que repete de cabeça há meses. Os números saem sem esforço porque
foram contados muitas vezes.

**VOICE_003** é a única em que Clara fala *para* alguém. Começa com a voz que se
usa ao telefone com um desconhecido e vai perdendo essa camada. O nome e a data
de nascimento no fim precisam sair limpos e audíveis — são a resposta de uma
senha do jogo.

**VOICE_004** é gravação de bolso: o aparelho está sobre uma superfície, não na
mão. As vozes chegam desiguais, uma mais perto que a outra. O vento é o
elemento contínuo. Não use música, não use silêncio artificial: as pausas
marcadas na transcrição devem ter ruído ambiente.

Nenhum grito, nenhum impacto, nenhum som de queda. A gravação termina seis
minutos antes da morte, com um clique.

## Trecho decisivo

O jogo permite enviar o trecho **02:19 – 02:38** de VOICE_004 dentro de uma
conversa. Se você produzir o áudio, exporte também esse recorte com o mesmo
nome acrescido de `-excerpt` (`VOICE_004-excerpt.m4a`) caso queira usá-lo
separadamente — hoje o jogo cita o trecho por texto, o que já é suficiente.
