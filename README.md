# O que Clara guardou

Jogo de investigação que roda **inteiramente no navegador**, sem servidor e sem
chave de API. Você recebe o celular de uma jovem morta e precisa descobrir o que
aconteceu — explorando os aplicativos do aparelho e conversando com as pessoas
próximas a ela, em português, com uma inteligência artificial que roda na sua
própria máquina.

---

## 1. O que é o jogo

Clara Mendonça Vasques, 24 anos, estudante de Jornalismo em Juiz de Fora, foi
encontrada morta na manhã de 9 de março de 2026, ao pé de um mirante. O
inquérito durou cinco semanas e foi arquivado como provável suicídio.

A mãe dela não aceitou. Dois meses depois, ela contrata você — um perito digital
independente — e entrega o aparelho da filha, devolvido pela polícia após o
arquivamento.

Duração estimada de uma primeira partida: **90 a 150 minutos**. Classificação
aproximada: **16 anos**. Sem violência gráfica, sem solução sobrenatural.

## 2. Como funciona a investigação

### A pasta reservada

Assim que os componentes terminam de instalar — e **antes** de o celular ligar —
aparece uma pasta lacrada que veio junto com o aparelho. Dentro dela está o
briefing do caso: quem era Clara, o que a polícia concluiu, quem são as três
pessoas com quem você pode falar, e **o código da tela do celular**.

A pasta continua acessível durante toda a partida pelo botão **Material do
caso**, no canto superior direito. O caderno da investigação fica aberto ao lado
do celular e oferece notas livres, fichas de pessoas e uma linha do tempo manual
com horário, título e descrição.

Quem retoma uma investigação salva entra direto no aparelho — a pasta fica ali
na lateral, para consulta.

- **20 aplicativos** no aparelho: chat, fotos, e-mail, contatos, agenda,
  navegador, chamadas, gravador, notas, mapas, nuvem, lixeira, saúde, banco,
  transporte, rede social, autenticador, tarefas, ajustes e notificações, além
  do caderno externo ao telefone.
- **69 pistas** com identificadores estáveis. O motor reconhece o conteúdo à
  medida que ele é consultado; o jogador registra suas próprias conclusões no
  caderno, sem um botão artificial de “marcar como pista”.
- **9 senhas**, todas solucionáveis com o que existe dentro do próprio aparelho.
  Nenhuma exige busca externa, força bruta ou trocadilho. Toda senha tem pelo
  menos duas rotas independentes de solução.
- **Deduções** aparecem em avisos narrativos quando informações suficientes se
  conectam. Ao mudar de ato, o jogo também mostra os novos aplicativos liberados.
- **Quatro atos**. O jogo avança quando você entende algo, não quando clica em
  determinada ordem. Cada transição de ato tem mais de uma porta de entrada.
- No fim, um **painel de reconstrução** com nove nós e um **formulário de
  acusação** com oito campos. Respostas parciais recebem retorno dirigido, não
  uma recusa seca.

Dicas ficam disponíveis o tempo todo, em três degraus (direção, foco,
resposta), e nunca penalizam nada.

## 3. Como a IA é utilizada

Quatro conversas são conduzidas pelo **Prompt API** do Chrome, com o modelo
local. Cada personagem tem uma **sessão separada**:

- prompt de sistema próprio;
- histórico próprio;
- e — o ponto central — **um conjunto de fatos próprio**.

O código do jogo calcula, a cada mensagem, quais fatos aquele personagem pode
usar naquele momento. Um fato que ele ainda não pode revelar simplesmente **não
é enviado** para a sessão. É a principal proteção contra vazamento narrativo:
não existe pedido, insistência ou truque de prompt capaz de extrair uma
informação que nunca chegou ao modelo.

Também vale o contrário: **a IA não decide nada**. Ela interpreta perguntas e
representa personagens. Quem decide se uma pista foi encontrada, se uma senha
foi aceita, se um ato avançou ou se o jogo terminou é a máquina de estados em
`src/engine/`.

Não há sistema de confiança nem pontos de afinidade. A personalidade de cada
personagem é integral desde a primeira mensagem. Eles escondem coisas por
motivos próprios, não por pontuação.

**Falas que carregam pista são escritas à mão em português** e entregues
diretamente, sem passar pelo modelo nem pela tradução. Isso garante que uma
palavra decisiva saia sempre exata, e que o mistério continue justo mesmo se o
modelo variar de uma execução para outra.

## 4. Como a tradução funciona

Você escreve em português. O jogo então:

1. traduz sua mensagem para inglês com o **Translator API**, localmente;
2. envia o texto em inglês para a sessão do personagem;
3. recebe a resposta em inglês;
4. traduz de volta para português;
5. mostra só o português.

Você nunca vê o inglês. Os prompts internos são em inglês porque o modelo local
interpreta personalidade e emoção com mais estabilidade nesse idioma.

Dois cuidados ficam em `src/ai/translator.ts`:

- **Glossário protegido.** Nomes, apelidos e marcas fictícias são trocados por
  sentinelas antes da tradução e restaurados depois. Sem isso, um apelido que é
  pista viraria outra palavra e a pista morreria.
- **Forma da mensagem.** A tradução é feita linha a linha, preservando quebras,
  emoji e a escrita fragmentada característica de cada personagem.

Nenhum serviço externo é usado. Nenhuma chave de API é pedida.

## 5. Quais dados permanecem no dispositivo

**Todos.** Nada sai do seu computador.

| Onde | O que |
|---|---|
| IndexedDB `clara-caso-0447` | progresso da investigação e registro técnico |
| localStorage | preferências, notas livres e linha do tempo manual do caderno |

O save guarda **somente identificadores e estados já alcançados**. Não há texto
de solução, não há segredo bloqueado e nenhuma chave tem nome revelador. O save
é assinado com um checksum: se for adulterado, é recusado com uma mensagem
amigável, sem apagar mais nada.

## 6. Requisitos do navegador

- **Chrome de computador**, versão 138 ou mais recente (148+ é o recomendado).
- Windows 10/11, macOS 13+, Linux ou Chromebook Plus.
- Cerca de **22 GB livres** no disco do perfil do Chrome.
- Placa de vídeo com mais de 4 GB, ou 16 GB de RAM com 4 núcleos.
- Conexão sem limite de dados **apenas para o primeiro download**.
- **Contexto seguro**: `localhost`, `127.0.0.1` ou HTTPS.

Celulares, Chrome para iOS e Web Workers não são suportados pelas APIs.

O celular do jogo **não liga** enquanto conversa e tradução não estiverem
verificadas e funcionando. Não existe modo de demonstração que ignore essa
verificação, nem em desenvolvimento — foi uma decisão de projeto.

## 7. Instalar as dependências

```bash
npm install
```

## 8. Rodar localmente

```bash
npm run dev
```

Abra o endereço que o Vite imprimir (`http://127.0.0.1:5173`).

## 9. Por que localhost ou HTTPS

O Prompt API e o Translator API só existem em **contexto seguro**. Abrir o
arquivo `index.html` direto do disco (`file://`) ou acessar por IP de rede local
sem HTTPS faz o navegador esconder as duas APIs, e o jogo mostra a tela de erro
correspondente. `localhost` e `127.0.0.1` são tratados como seguros pelo próprio
navegador, o que basta para desenvolver.

Além disso, `create()` exige **ativação do usuário** — é por isso que o download
dos componentes só começa depois que você clica em "Baixar e instalar".

## 10. Gerar o build de produção

```bash
npm run build
npm run preview
```

O build sai sem *source maps*, minificado, e com o conteúdo narrativo dividido
em quatro arquivos (`cap-a` a `cap-d`), um por ato.

## 11. Substituir fotografias e áudios

Os assets são **opcionais** e substituíveis sem tocar em código.

- Fotos: coloque o arquivo em `public/assets/photos/<ID>.jpg`, usando o
  identificador da foto (`PHOTO_001.jpg`, `PHOTO_014.jpg`, …).
- Áudios: coloque em `public/assets/audio/<ID>.m4a` (`VOICE_004.m4a`, …).

Enquanto o arquivo não existir, o jogo desenha um **placeholder** com os
metadados corretos (data, hora, álbum e descrição). No caso dos áudios, a
transcrição cronometrada é sempre a fonte oficial do conteúdo — o arquivo de som
é um acréscimo.

Os **prompts de geração das 20 fotografias** estão em
[`docs/PRODUCAO-FOTOS.md`](docs/PRODUCAO-FOTOS.md), fora de `src/`, portanto
fora do pacote enviado ao navegador. Os roteiros de gravação estão em
[`docs/PRODUCAO-AUDIO.md`](docs/PRODUCAO-AUDIO.md).

## 12. Limpar ou migrar o progresso salvo

Para apagar tudo e recomeçar, abra **Opções** no canto superior direito e use
**Reiniciar o jogo do zero**. Isso remove o progresso, as conversas, as notas e
a linha do tempo manual; os modelos locais do Chrome e as preferências de
acessibilidade permanecem instalados.

O save tem versão. Ao subir de versão, `src/persistence/save.ts` decide o que
fazer:

- **v1 → v2**: o save da versão 1 pertence a um protótipo com outra história e é
  descartado de propósito. O jogo avisa isso ao restaurar.
- Formatos futuros devem ganhar uma função de migração no mesmo arquivo, em vez
  de invalidar o progresso existente.

Um save cujo checksum não confere é recusado e você recomeça — nada mais no
navegador é afetado.

## 13. Limitações da proteção contra inspeção

A aplicação roda inteiramente no navegador. **Não existe proteção absoluta**
contra alguém determinado a ler o código pelo DevTools, e este projeto não
finge o contrário.

O que foi feito, como esforço razoável contra spoiler acidental:

- o conteúdo é dividido por ato e carregado sob demanda — **o texto do desfecho
  não está no pacote inicial**;
- o prompt do desfecho vive num módulo separado, carregado só no último ato;
- identificadores são opacos (`CLUE_0xx`, `EVENT_0xx`), sem nomes como
  "assassino" ou "solução";
- *source maps* desativados e minificação ativada no build;
- o estado não é exposto em variáveis globais e os prompts não ficam no HTML;
- toda transição passa pela máquina de estados;
- o save carrega apenas IDs, é validado e tem checksum;
- o painel de diagnóstico só existe em desenvolvimento.

O que **não** foi feito, por ser hostil ou inútil: bloquear clique direito,
bloquear F12, interceptar atalhos, laços com `debugger`, detectar DevTools ou
apagar o progresso de quem inspeciona.

> **Proteção real exigiria um backend** que não enviasse os segredos ao
> navegador — mantendo o texto do desfecho, o gabarito da acusação e a lógica de
> julgamento no servidor, e liberando cada trecho apenas quando o estado
> validado do lado do servidor permitisse. Este projeto é intencionalmente
> offline e local, então essa troca não foi feita.

## 14. Limitações das APIs experimentais do Chrome

Estas APIs ainda mudam de assinatura. Os pontos que afetam o projeto hoje:

- `LanguageModel.availability()` devolve
  `available | downloadable | downloading | unavailable` na especificação atual,
  mas parte da documentação e versões anteriores usam `readily | after-download`.
  O adaptador normaliza os dois conjuntos.
- `e.loaded` no evento `downloadprogress` é **normalizado de 0 a 1**, não é
  contagem de bytes. E `loaded === 1` não significa pronto: ainda há extração e
  carga em memória, exibidas como estado indeterminado.
- `create()` exige ativação do usuário e **não** deve receber `signal`;
  `AbortSignal` vale apenas para `prompt()`.
- Nomes renomeados: `inputUsage` → `contextUsage`, `inputQuota` →
  `contextWindow`, `quotaoverflow` → `contextoverflow`.
- O Chrome pode **remover** o modelo se o disco ficar cheio ou se houver
  atualização do componente. O jogo trata isso como erro recuperável.

Todo acesso às APIs passa por `src/ai/`, para que uma mudança futura seja
resolvida num único lugar.

## 15. Adicionar um novo personagem de chat

1. Acrescente o identificador em `CharacterId` (`src/engine/types.ts`).
2. Escreva o perfil em `src/content/characters/base.ts`: nome exibido, estilo de
   escrita, ritmo de digitação, prompt de sistema em inglês, falas de abertura em
   português e as respostas canônicas a metalinguagem e ameaça.
3. Declare em `src/engine/disclosure.ts` os fatos que ele pode usar e sob quais
   condições (ato mínimo, intenções detectadas, pistas apresentadas, eventos).
   **Só o que estiver aqui chega à sessão de IA.**
4. Se ele deve aparecer só depois de um gatilho, trate isso em
   `src/engine/rules.ts` e no redutor, como foi feito com o contato anônimo.
5. Inclua o identificador em `activeCharacters()`
   (`src/engine/selectors.ts`) e no estado inicial, se ele existir desde o começo.

Não é preciso mexer na interface: a lista de conversas é gerada a partir dessas
definições.

---

## Estrutura do projeto

```
src/
  ai/           adaptadores do Chrome, boot em 14 etapas, sessões, erros
  engine/       máquina de estados, regras, senhas, intenções, divulgação
  content/      manifesto, pacotes por ato, personagens, dossiê, assets
  persistence/  IndexedDB, save com checksum, preferências, diagnóstico
  ui/           boot, pasta do caso, celular, 21 aplicativos, acusação e revelação
docs/           material de produção (fora do pacote do navegador)
public/assets/  fotos e áudios substituíveis
```

## Notas de interface

- **Ponteiro próprio.** Uma mira de perícia acompanha o mouse; elementos
  acionáveis recebem o alvo preenchido, e itens desabilitados, o alvo riscado.
  Campos de texto mantêm o cursor nativo de digitação, de propósito.
- **Sem seleção de texto.** Arrastar pela tela não seleciona nada — a exceção
  são os campos onde o jogador digita e o código da tela dentro da pasta, que
  continua copiável.
- **Barra de rolagem no tom do aparelho**, mais discreta dentro da tela do
  celular do que no resto da página.
- **Feedback narrativo.** Novas deduções e mudanças de ato interrompem
  brevemente a investigação com uma revelação legível; partidas restauradas não
  repetem avisos já vistos.

## Sobre testes

Este repositório não inclui suíte de testes automatizados, por decisão de
escopo. A verificação é o `npm run build` (que roda `tsc -b`) mais a partida
manual.
