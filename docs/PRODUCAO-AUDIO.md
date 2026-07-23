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

---

## Guia de produção no ElevenLabs

Nomes exatos de modelo e recursos mudam com frequência nessa API — confira o
painel da sua conta antes de começar. Em julho de 2026, o recurso relevante
para diálogo com emoção é o modelo **v3** (com tags de expressão entre
colchetes e o modo **Text to Dialogue** para múltiplos falantes) e, como
alternativa mais estável para narração de um único personagem, **Multilingual
v2**. Use v3 quando disponível na sua conta; caia para v2 se não estiver.

### Conta e configuração geral

- **Plano**: Creator ou superior — libera Voice Design (criar voz a partir de
  descrição em texto) e cota de caracteres suficiente para os quatro áudios
  (pouco mais de 20 minutos de fala no total).
- **Idioma**: português do Brasil. Os modelos multilíngues da ElevenLabs
  reconhecem o idioma pelo texto de entrada — não é preciso configurar nada
  além de escrever em PT-BR.
- **Formato de exportação**: MP3 44.1 kHz, 192 kbps (acima do padrão de 128,
  para não perder detalhe nos trechos sussurrados do VOICE_004).
- **Conversão final**: o jogo espera `.m4a`. Depois de exportar o MP3:

  ```bash
  ffmpeg -i entrada.mp3 -c:a aac -b:a 192k VOICE_00X.m4a
  ```

- **Onde salvar**: `public/assets/audio/VOICE_00X.m4a`, sobrescrevendo o
  placeholder. Nenhuma outra configuração no código é necessária.

### As duas vozes

**CLARA** — narra sozinha em VOICE_001, VOICE_002 e VOICE_003; é uma das duas
vozes em VOICE_004.

> Se for usar Voice Design (Vozes → Criar voz → Gerar a partir de texto),
> prompt sugerido:
> *"Voz feminina brasileira, 24 anos, sotaque de Minas Gerais suave, tom
> caloroso e levemente rouco. Cadência de pessoa real falando rápido quando
> está animada e mais devagar quando está cansada — sem afetação de
> locutora ou podcaster."*

Configuração de base (Voice Settings):

| Parâmetro | Valor |
|---|---|
| Stability | 35–45 (baixo de propósito — o jogo depende de contraste emocional entre os quatro áudios) |
| Similarity | 75–85 |
| Style | varia por arquivo, ver abaixo |
| Speaker boost | ligado |

**ALICE** — só aparece em VOICE_004, ao lado de Clara.

> Prompt de Voice Design:
> *"Voz feminina brasileira, 24 anos, dicção precisa e controlada como
> alguém formada em Direito. Tom que começa calmo e formal e pode ficar
> tenso e cortante sob pressão. Sem sotaque regional marcado."*

| Parâmetro | Valor |
|---|---|
| Stability | 45–55 (mais estável que Clara — ela se controla; quando quebra, é abrupto) |
| Similarity | 80 |
| Style | varia por trecho, ver VOICE_004 abaixo |
| Speaker boost | ligado |

### VOICE_001 — `pauta_documentario.m4a`

Só Clara. Texto de entrada: o transcrito completo em `src/content/act3.ts`
(constante `VOICES`, id `VOICE_001`). Troque `(risada)` por `[laughs]` se
estiver usando v3 com tags.

- Stability **30**, Style **45** — leve, acelerada, rindo de si mesma.
- Tags sugeridas por trecho: `[excited]` na abertura; `[laughs]` antes de
  "Isso é bom. Isso é muito bom." e depois de "Ela sempre fala."; tom mais
  quieto no fecho, antes de "Beijo, Clara do futuro."

### VOICE_002 — `_.m4a`

Só Clara. É o oposto do VOICE_001: monólogo noturno, voz baixa, achatada,
**sem choro**.

- Stability **50**, Style **20** — nada de dramatização vocal, o texto já
  carrega o peso sozinho.
- Instrução extra no prompt de geração (campo de contexto, se o modelo
  aceitar): "não chorar, não tremer a voz — tom quase monotônico de quem já
  contou essa história muitas vezes para si mesma."
- As pausas longas marcadas no transcrito ("(pausa, 14 segundos)") não devem
  ser confiadas ao modelo — ele não segura silêncio bem acima de 2–3s. Gere os
  blocos separados pelas pausas e monte o silêncio manualmente no editor.

### VOICE_003 — `pra eles.m4a`

Só Clara. É a única gravação em que ela fala *para* alguém — começa formal e
vai perdendo essa camada. Gere em dois blocos com configurações diferentes e
uma os arquivos depois:

| Bloco | Trecho | Stability | Style |
|---|---|---|---|
| A | do início até "…e eu não desci de novo." | 50 | 25 |
| B | daí até "Eu decorei tudo." | 35 | 45 |

**Atenção**: a frase final — *"Wesley Andrade da Silva. Dezessete de abril de
mil novecentos e noventa e oito."* — é a resposta de uma senha do jogo
(LOCK_004). Gere essa frase isolada, com Stability **60** para garantir
clareza total, e nivele o volume dela igual ao resto na mixagem.

### VOICE_004 — `gravacao_080326_1946.m4a`

Duas vozes, cena externa, o arquivo mais importante do jogo — é o que muda a
investigação de rumo.

- Se sua conta tiver **Text to Dialogue** (modo multi-falante do v3), marque
  `Speaker 1` = Clara e `Speaker 2` = Alice e deixe o modelo alternar. Sem
  esse recurso, gere cada fala separadamente por personagem e monte no
  editor, usando os tempos `[t]` do transcrito como guia de ritmo — eles não
  são timestamps exatos, são referência de cadência.
- **Ambiente**: TTS não gera vento nem cascalho. Baixe um loop de vento leve
  e passos em cascalho no freesound.org e coloque como camada contínua a
  −18/−20 dB do início ao fim.
- Marcações como `(pausa, 6 segundos)` e `(vento; 8 segundos)` são silêncio,
  não fala — não peça ao modelo para "atuar" a pausa; edite o espaço em
  branco depois.

**Progressão de Alice** (ela evolui de afeto genuíno para controle frio — o
contraste é a pista central do arquivo, então não achate as configurações):

| Trecho | Tom | Stability | Style |
|---|---|---|---|
| 00:52–02:12 ("Que frio, meu Deus" → "Que consideração.") | preocupada, afeto genuíno | 55 | 20 |
| 02:15–02:38 ("Eu tava dirigindo…" → "A gente cai junto.") | fria, cortante, ameaça contida | 45 | 40 |
| 02:40–03:56 (discussão sobre Wesley) | defensiva | 40 | 35 |
| 03:56–04:36 ("Você tá gozando disso" → "Desculpa, desculpa, desculpa") | máscara caindo, descontrole | 30 | 55 |
| 05:01–06:10 (final, "Onde tá?" → silêncio) | recomposta, fria de novo | 50 | 25 |

> O trecho **02:15–02:38** é a fala mais importante do jogo — é o que o
> jogador envia como prova decisiva no Ato 4. Vale gerar várias tomadas e
> escolher a melhor manualmente, em vez de aceitar a primeira.

**Progressão de Clara** neste arquivo:

- Começa exausta e resignada — Stability 55, Style 20.
- "Eu gravei." (04:16) precisa de peso: pequena pausa antes, tom baixo mas
  firme — Style 30.
- Fecho ("A gente cai junto. Você que falou." / "Tá. Tô desligando.") —
  cansada, decidida — Style 25.

### Checklist por arquivo

1. Gerar o áudio na ElevenLabs (ou por blocos, conforme a tabela do arquivo).
2. Montar pausas e, no caso do VOICE_004, a camada de ambiente, no Audacity.
3. Normalizar em torno de −16 LUFS.
4. Exportar MP3 em alta qualidade.
5. Converter para `.m4a` com `ffmpeg`.
6. Salvar como `VOICE_00X.m4a` em `public/assets/audio/`.
