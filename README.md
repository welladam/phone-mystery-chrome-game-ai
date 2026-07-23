# O Mistério de Clara

Jogo de investigação que roda **inteiramente no navegador**, sem servidor e sem
chave de API. Você recebe o celular de uma jovem morta e precisa descobrir o que
aconteceu — explorando os aplicativos do aparelho e conversando com as pessoas
próximas a ela no idioma escolhido, com uma inteligência artificial que roda na
sua própria máquina.

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
do celular e oferece notas livres para o jogador organizar a investigação do
próprio jeito. No modo Normal, ele também reúne deduções, pessoas e dicas.

Quem retoma uma investigação salva entra direto no aparelho — a pasta fica ali
na lateral, para consulta.

- **20 aplicativos**, todos visíveis desde o início: chat, fotos, e-mail, contatos, calendário,
  navegador, telefone, gravador, notas, mapas, Drive, lixeira, saúde, banco,
  corridas, rede social, autenticador, tarefas, ajustes e notificações, além
  do caderno externo ao telefone.
- **69 pistas** com identificadores estáveis. O motor reconhece o conteúdo à
  medida que ele é consultado; o jogador registra suas próprias conclusões no
  caderno, sem um botão artificial de “marcar como pista”.
- **9 senhas**, todas solucionáveis com o que existe dentro do próprio aparelho.
  Nenhuma exige busca externa, força bruta ou trocadilho. Toda senha tem pelo
  menos duas rotas independentes de solução.
- **Dois modos de jogo**: Normal, com deduções, pessoas, dicas e destaques; e
  Difícil, que registra a mesma progressão em silêncio e deixa a análise por
  conta do jogador.
- **Quatro atos**. O jogo avança quando você entende algo, não quando clica em
  determinada ordem. Cada transição de ato tem mais de uma porta de entrada.
- No fim, o caderno apresenta quatro pontos para reflexão — responsável,
  motivo, método e oportunidade — e pede que o jogador escreva apenas o nome
  do responsável. Uma resposta errada não revela suspeitos nem pistas extras.

Dicas ficam disponíveis no modo Normal, em três degraus (direção, foco,
resposta), e nunca penalizam nada. No modo Difícil, a aba permanece bloqueada.

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

**Falas que carregam pista são escritas à mão em cada pacote de idioma** e entregues
diretamente, sem passar pelo modelo nem pela tradução. Isso garante que uma
palavra decisiva saia sempre exata, e que o mistério continue justo mesmo se o
modelo variar de uma execução para outra.

## 4. Como a tradução funciona

Você escreve no idioma escolhido. O jogo então:

1. traduz sua mensagem do idioma ativo para inglês com o **Translator API**, localmente;
2. envia o texto em inglês para a sessão do personagem;
3. recebe a resposta em inglês;
4. traduz do inglês de volta para o idioma ativo;
5. mostra somente o idioma escolhido.

Você nunca vê o inglês, exceto se um futuro pacote `en-US` estiver ativo. Nesse
caso, os dois tradutores viram adaptadores de identidade e nenhum pacote de
tradução é baixado. Os prompts internos permanecem em inglês porque o modelo
local interpreta personalidade e emoção com mais estabilidade nesse idioma.

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
| IndexedDB `clara-caso-0447` | progresso da investigação, separado por locale (`slot-principal:pt-BR`, por exemplo) |
| localStorage | preferência global de idioma e notas separadas (`clara.case-notes.v2:pt-BR`) |

O save guarda **somente identificadores e estados já alcançados**. Não há texto
de solução, não há segredo bloqueado e nenhuma chave tem nome revelador. O save
é assinado com um checksum: se for adulterado, é recusado com uma mensagem
amigável, sem apagar mais nada.

Ao trocar o idioma em **Opções**, o jogo salva o slot atual, encerra tradutores e
sessões da IA, recarrega a página e abre o slot daquele idioma. O save legado sem
locale e as notas antigas são migrados uma única vez para `pt-BR`.

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

Antes da compilação, `npm run validate:locales` confere o catálogo, os módulos
obrigatórios, os nomes genéricos do runtime de tradução e os áudios exigidos.
O build sai sem *source maps*, minificado, e com o conteúdo narrativo dividido
em quatro arquivos (`cap-a` a `cap-d`), um por ato.

## 11. Substituir fotografias e áudios

Os assets são **opcionais** e substituíveis sem tocar em código. Cada foto e
cada áudio é carregado pelo **nome de arquivo real** definido na história — o
campo `file` de cada foto em `src/content/shared.ts` e o `id` de cada áudio.

- Fotos: coloque o arquivo em `public/assets/photos/` com o mesmo nome que
  aparece no campo "Arquivo" da própria foto no jogo — por exemplo
  `IMG_20260308_1944.jpg` (a foto do mirante), `tribuna_barao.png` (a matéria)
  ou `print_live_diego_080326.png` (a transmissão). A extensão pode ser `.jpg`
  ou `.png`, o que já estiver no nome.
- Áudios: coloque em `public/assets/audio/<locale>/` com o identificador da
  gravação — por exemplo, `public/assets/audio/pt-BR/VOICE_001.m4a` a
  `VOICE_004.m4a`. Não existe fallback para áudio de outro idioma.

Enquanto o arquivo não existir, o jogo desenha um **placeholder** com os
metadados corretos (data, hora, álbum e descrição). No caso dos áudios, a
transcrição cronometrada é sempre a fonte oficial do conteúdo — o arquivo de som
é um acréscimo.

Os **prompts de geração das 20 fotografias** estão em
[`docs/PRODUCAO-FOTOS.md`](docs/PRODUCAO-FOTOS.md), fora de `src/`, portanto
fora do pacote enviado ao navegador. Os roteiros de gravação estão em
[`docs/PRODUCAO-AUDIO.md`](docs/PRODUCAO-AUDIO.md).

## 12. Adicionar um idioma

O registro central fica em `src/locales/registry.ts`. Cada idioma deve fornecer:

1. metadados BCP-47, idioma da Translator API e diretório próprio de áudio;
2. catálogo completo de interface, acessibilidade, boot e erros;
3. módulos de conteúdo dos Atos 1–4, mantendo os mesmos IDs e condições;
4. perfis, prompts, fatos em inglês, intenções, falas canônicas e proteção contra
   nomes inventados do chat;
5. todos os `VOICE_ID` obrigatórios no diretório do locale.

`pt-BR` é o pacote jogável completo. `en-US` está visível no seletor como exemplo
indisponível e só deve receber `enabled: true` depois de completar conteúdo e
áudio. Execute `npm run validate:locales` antes de habilitar qualquer pacote.

## 13. Limpar ou migrar o progresso salvo

Para apagar tudo e recomeçar, abra **Opções** no canto superior direito e use
**Reiniciar o jogo do zero**. Isso remove o progresso, as conversas, as notas e
o modo escolhido; os modelos locais do Chrome e as preferências de
acessibilidade permanecem instalados.

O save tem versão. Ao subir de versão, `src/persistence/save.ts` decide o que
fazer:

- **v1 → v2**: o save da versão 1 pertence a um protótipo com outra história e é
  descartado de propósito.
- **v2 → v3**: pistas, conversas e progresso são preservados; a investigação
  restaurada assume o modo Normal e os dados antigos da linha do tempo são ignorados.
- Formatos futuros devem ganhar uma função de migração no mesmo arquivo, em vez
  de invalidar o progresso existente.

Um save cujo checksum não confere é recusado e você recomeça — nada mais no
navegador é afetado.

## 14. Limitações da proteção contra inspeção

A aplicação roda inteiramente no navegador. **Não existe proteção absoluta**
contra alguém determinado a ler o código pelo DevTools, e este projeto não
finge o contrário.

O que foi feito, como esforço razoável contra spoiler acidental:

- os registros dos atos iniciais ficam disponíveis desde o começo, mas **o texto
  do desfecho não está no pacote inicial** e só é carregado no Ato 4;
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
> navegador — mantendo o texto do desfecho e a lógica de
> julgamento no servidor, e liberando cada trecho apenas quando o estado
> validado do lado do servidor permitisse. Este projeto é intencionalmente
> offline e local, então essa troca não foi feita.

## 15. Limitações das APIs experimentais do Chrome

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

## 16. Adicionar um novo personagem de chat

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
  locales/      registro, textos, conteúdo por ato e pacote de chat de cada idioma
  i18n/         provider React tipado e interpolação de mensagens
  persistence/  IndexedDB, save com checksum, preferências, diagnóstico
  ui/           boot, pasta do caso, celular, 21 aplicativos, acusação e revelação
docs/           material de produção (fora do pacote do navegador)
  public/assets/  fotos e áudios versionados por locale
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

Este repositório não inclui suíte de testes de interface, por decisão de escopo.
A verificação automatizada é o `npm run build`, que executa a validação de
locales, `tsc -b` e o build de produção, complementada por uma partida manual.
