# O Mistério de Clara

[Visão rápida](README.pt-BR.md) · [Full documentation in English](README_FULL.md) · [Documentação completa em português](README_FULL.pt-BR.md) · [Documentos de produção](docs/README.md)

![Pôster de O Mistério de Clara](public/assets/art/clara-poster-v2.png)

[Jogar online](https://welladam.github.io/phone-mystery-chrome-game-ai/)

Jogo narrativo de investigação, open source, que roda inteiramente no navegador. Você recebe o celular de uma jovem cuja morte foi tratada como provável suicídio. Explore os aplicativos, recupere o que foi escondido, converse com as pessoas próximas a ela e descubra o que realmente aconteceu.

As conversas usam o Prompt API do Chrome e o Gemini Nano no próprio dispositivo. Não existe backend, inferência na nuvem, chave de API ou sistema de contas: modelo, tradução, estado do jogo e progresso permanecem no computador do jogador.

> **Estado do projeto:** protótipo jogável, versão 0.1.0. Português brasileiro está completo e habilitado. O locale em inglês é um pacote de referência propositalmente incompleto e desabilitado.

> **Aviso de conteúdo:** recomendado para maiores de 16 anos. A história aborda morte, luto, coação, culpa e violência sem descrição gráfica. Não há representação gráfica da morte nem solução sobrenatural.

## 100% criado por IA, 100% vibe coding

Este projeto é um experimento de desenvolvimento criativo totalmente assistido por IA. **O código-fonte, game design, mistério, personagens, diálogos, documentos de produção, fotografias, artes e áudios foram todos criados com inteligência artificial.**

O projeto foi construído por meio de **100% vibe coding usando Codex e Claude**: as ideias foram descritas em linguagem natural, implementadas iterativamente pela IA, avaliadas no projeto em execução e refinadas com novos prompts. A direção humana definiu a intenção criativa, selecionou resultados, pediu revisões e guiou a experiência final; o processo de implementação e geração de conteúdo foi conduzido com IA.

Os prompts e resultados narrativos estão preservados em [`docs/`](docs/README.md) como registro transparente desse processo.

## O jogo

Clara Mendonça Vasques, 24 anos, estudante de Jornalismo e editora de vídeo freelancer em Juiz de Fora, foi encontrada morta na manhã de 9 de março de 2026, ao pé de um mirante. Após cinco semanas, o inquérito foi arquivado com forte indicação de suicídio.

A mãe dela não aceita essa conclusão. Dois meses depois, ela contrata você como perito digital independente e entrega o celular de Clara, devolvido pela polícia após o arquivamento.

A primeira partida dura aproximadamente **90–150 minutos**. Tudo que é necessário para resolver o mistério existe dentro do aparelho e nas contradições entre as pessoas que respondem.

### O que o jogador faz

- Explora **20 aplicativos no celular** e um caderno do caso externo.
- Examina **72 pistas registradas** sem precisar marcar manualmente itens como evidência.
- Resolve **9 senhas fair play** usando informações disponíveis no próprio aparelho.
- Avança por **quatro atos** guiados por descobertas e compreensão, não por uma sequência fixa de cliques.
- Conversa com três pessoas desde o início e com um quarto contato anônimo depois de um gatilho narrativo.
- Escreve suas próprias notas e, no ato final, identifica a pessoa responsável.

Todos os aplicativos aparecem desde o começo. Conteúdos públicos podem ser explorados imediatamente; aplicativos, álbuns, documentos e gravações protegidos mostram a tela de senha até a resposta correta. A revelação final permanece isolada até o estado narrativo adequado.

### Modos de dificuldade

| Modo | Experiência |
|---|---|
| Normal | Mostra deduções, pessoas, dicas progressivas, avisos narrativos de avanço e destaques em possíveis evidências. |
| Difícil | Registra silenciosamente as mesmas descobertas e progressão, mas bloqueia deduções, pessoas e dicas e remove destaques de pistas. Feedback funcional, como senha incorreta e mensagem não lida, continua visível. |

A dificuldade é escolhida antes de o celular ligar e fica no save daquele idioma. Reiniciar a investigação também limpa o modo escolhido.

### Material e caderno do caso

Depois que os componentes locais ficam prontos — e antes de o celular ligar — o jogador recebe uma pasta lacrada que veio com o aparelho. Ela contém o briefing sem spoilers, a conclusão da polícia, os três contatos iniciais e o PIN da tela. A pasta continua disponível ao lado de **Opções** durante toda a investigação.

O caderno abre fora do telefone, ao lado dele em telas largas. As anotações livres imitam papel pautado e são salvas automaticamente no navegador. O modo Normal também mostra deduções, pessoas conhecidas e dicas progressivas; no modo Difícil, essas abas permanecem visíveis e bloqueadas. No Ato 4, a acusação pede que o jogador compreenda responsável, motivo, método e oportunidade, mas somente o nome da pessoa responsável é enviado.

O aparelho contém Notificações, Chat, Fotos, E-mail, Contatos, Calendário, Navegador, Telefone, Gravador, Notas, Mapas, Drive, Lixeira, Saúde, Banco, Corridas, Rede Social, Autenticador, Tarefas e Ajustes. O caderno é a vigésima primeira superfície registrada, mas aparece externamente.

## Como a IA é utilizada

A IA interpreta personagens; ela não controla o mistério.

Cada personagem conduzido por IA possui uma sessão isolada do Prompt API com:

- prompt de sistema próprio;
- histórico de conversa próprio;
- personalidade e ritmo de escrita distintos;
- conjunto próprio de fatos permitidos pelo motor naquele momento.

A cada turno, o motor determinístico calcula o que aquele personagem pode saber e revelar. Um fato bloqueado não fica escondido dentro de um prompt maior: ele simplesmente não é enviado à sessão. Portanto, injeção de prompt, insistência ou um pedido direto pela solução não conseguem recuperar uma informação que o modelo nunca recebeu.

O limite inverso é igualmente importante: o modelo não pode destravar aplicativo, aceitar senha, descobrir pista, avançar ato nem terminar o jogo. Essas decisões pertencem à máquina de estados em `src/engine/`.

Não existe pontuação de confiança nem relacionamento controlado por temperatura. Cada personagem tem sua personalidade integral desde a primeira mensagem e esconde informações por razões narrativas.

### Proteções narrativas determinísticas

- **Falas canônicas de pista:** diálogos que carregam informações exatas são escritos em cada locale e retornados diretamente.
- **Divulgação de fatos:** somente fatos autorizados pelo estado atual são injetados na sessão.
- **Proteção de nomes:** cada personagem e ato possui uma lista determinística de nomes. Nomes inventados recebem uma negativa canônica e não viram fatos do caso.
- **Detecção de intenções:** expressões localizadas reconhecem perguntas relevantes, enquanto IDs estáveis mantêm a progressão independente da frase usada.
- **Sessões separadas:** um personagem não pode ler o histórico de outro.

A matriz de nomes de produção está em [`docs/MATRIZ-NOMES-IA.md`](docs/MATRIZ-NOMES-IA.md).

## Como a tradução local funciona

A sessão do Prompt API opera em inglês. Em um locale jogável que não seja inglês, cada turno segue este fluxo:

```text
mensagem do jogador no idioma ativo
        ↓  Translator API do Chrome
prompt do turno em inglês + fatos liberados
        ↓  Prompt API / Gemini Nano
resposta do personagem em inglês
        ↓  Translator API do Chrome
balões localizados salvos no slot daquele idioma
```

Nomes, apelidos e marcas fictícias são substituídos temporariamente por sentinelas antes da tradução e restaurados depois. A tradução ocorre linha a linha para preservar emoji, quebras e a escrita fragmentada de cada personagem.

Em um futuro pacote `en-US` jogável, as duas direções usam adaptadores de identidade e nenhum pacote de tradução é solicitado.

## Inicialização e download dos modelos

O celular não liga enquanto os componentes locais obrigatórios não estiverem disponíveis e verificados.

1. O jogador escolhe o idioma jogável e a dificuldade.
2. A inicialização verifica Prompt API, Translator API, contexto seguro, armazenamento e disponibilidade dos modelos.
3. Se o Chrome indicar componentes ausentes, o jogador inicia o download explicitamente. A criação do modelo exige ativação do usuário.
4. A interface informa em tempo real autorização, download, instalação e verificação.
5. Um teste completo verifica tradução para inglês, resposta do modelo e tradução de volta.
6. Somente depois que tudo funciona o celular é ligado.

Os modelos e pacotes de idioma pertencem ao Chrome. Normalmente são reutilizados depois do primeiro download, mas o navegador pode atualizá-los ou removê-los quando falta espaço. Uma visita futura pode apenas verificar o que já existe ou solicitar novo download.

## Requisitos de navegador e hardware

Para a experiência web completa:

- **Google Chrome 148 ou superior no computador.** O Prompt API para sites começa no Chrome 148; o Translator API está disponível desde o Chrome 138.
- Windows 10/11, macOS 13+, Linux ou Chromebook Plus com versão compatível do ChromeOS.
- Pelo menos **22 GB livres** no volume que contém o perfil do Chrome.
- Mais de 4 GB de VRAM, ou pelo menos 16 GB de RAM e 4 núcleos de CPU para execução pela CPU.
- Conexão sem limite de dados para o download inicial dos modelos e pacotes de idioma.
- Contexto seguro: `localhost`, `127.0.0.1` ou HTTPS.

Chrome para Android e iOS não é compatível com as APIs de modelo fundamental usadas aqui. O Translator API também não funciona em Web Workers.

Requisitos e assinaturas ainda podem mudar. Consulte a documentação oficial do [Prompt API](https://developer.chrome.com/docs/ai/prompt-api), [Translator API](https://developer.chrome.com/docs/ai/translator-api) e o [estado das Built-in AI APIs](https://developer.chrome.com/docs/ai/built-in-apis) antes de publicar.

## Rodar localmente

### Pré-requisitos

- Node.js com npm
- Google Chrome para computador compatível
- Hardware e armazenamento descritos acima

### Instalar e iniciar

```bash
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite, normalmente [http://127.0.0.1:5173](http://127.0.0.1:5173).

Não abra `index.html` diretamente por `file://` nem use um IP de rede local sem HTTPS. Esses endereços não são contextos seguros e o Chrome não expõe as APIs necessárias.

### Build de produção

```bash
npm run build
npm run preview
```

`npm run build` executa:

1. `npm run validate:locales`;
2. compilação dos projetos TypeScript com `tsc -b`;
3. build minificado do Vite.

Source maps ficam desabilitados. O conteúdo narrativo é dividido por ato, incluindo um arquivo separado para o Ato 4, de forma que a revelação não pertença ao download inicial.

### Scripts disponíveis

| Comando | Função |
|---|---|
| `npm run dev` | Inicia o Vite em `127.0.0.1`. |
| `npm run validate:locales` | Valida contratos, textos visíveis, IDs obrigatórios e áudios dos locales jogáveis. |
| `npm run build` | Valida locales, verifica tipos e gera a produção. |
| `npm run preview` | Visualiza o build de produção em `127.0.0.1`. |

## Diagnóstico de problemas

| Sintoma | O que verificar |
|---|---|
| Prompt API ou Translator API ausente | Use Chrome 148+ no computador, confirme HTTPS ou localhost e verifique os requisitos do modelo. |
| Componentes aparecem novamente como disponíveis para download | O Chrome pode ter atualizado ou removido um modelo. Mantenha espaço livre e inicie pelo botão da tela de boot. |
| Download chega a 100% antes de concluir | `downloadprogress.loaded` chega a 1 antes de extração e carga em memória necessariamente acabarem. Aguarde a verificação. |
| Tradução ou conversa é interrompida | Tente novamente pela tela de erro localizada. O progresso aceito e mensagens anteriores permanecem salvos. |
| Funciona em desenvolvimento, mas não na hospedagem | Confirme HTTPS e verifique se o app não está em iframe cross-origin sem a Permissions Policy necessária. |
| O progresso não pode ser salvo | IndexedDB pode estar bloqueado por navegação privada, política corporativa, falta de espaço ou outra aba. |

O estado atual dos componentes do Chrome pode ser inspecionado em `chrome://on-device-internals`.

## Privacidade e persistência

Nenhum dado da investigação ou prompt é enviado para este projeto, para o Google ou para um servidor externo do jogo. Inferência e tradução acontecem no dispositivo por modelos gerenciados pelo navegador.

| Armazenamento | Conteúdo |
|---|---|
| IndexedDB `clara-caso-0447` | Estado da investigação e diagnósticos. Saves usam chaves por locale, como `slot-principal:pt-BR`. |
| `localStorage` `clara.prefs.v1` | Idioma, preferências de acessibilidade e som e último aplicativo. |
| `localStorage` `clara.case-notes.v2:<locale>` | Anotações livres do jogador, separadas por idioma. |

O save contém IDs e estados já alcançados, não o texto bloqueado da solução. Um checksum detecta alterações casuais; saves malformados ou incompatíveis são recusados com segurança. Saves e notas legados são migrados uma vez para `pt-BR`.

Ao trocar o idioma, o jogo salva o slot atual, destrói tradutores e sessões, recarrega a página e abre a investigação independente daquele locale. Partidas restauradas não reproduzem notificações antigas.

Use **Opções → Reiniciar o jogo do zero** para apagar progresso, conversas, notas, dificuldade e dados legados da linha do tempo no locale ativo. Modelos do Chrome e preferências de acessibilidade permanecem instalados.

### Versões e migração do save

- **v1 → atual:** o primeiro protótipo, com um único chat, descrevia outra história; por isso, aquele estado incompatível é descartado de propósito.
- **v2 → v3:** pistas, conversas, atos e descobertas são preservados; partidas restauradas assumem o modo Normal, a linha do tempo antiga é ignorada e apenas um nome livre já digitado na acusação é mantido.
- **Armazenamento anterior aos locales → pt-BR:** slot e caderno legados são migrados uma única vez, pois todo o conteúdo anterior era português brasileiro.

Mudanças futuras no formato devem adicionar migração explícita, em vez de invalidar progresso compatível. Se o checksum falhar, uma investigação limpa é iniciada sem alterar outros dados do navegador.

## Estrutura do projeto

```text
src/
  ai/           adaptadores do Chrome, disponibilidade, boot, sessões e erros
  content/      manifesto neutro, atos, personagens, dossiê e assets
  engine/       estado, regras, divulgação, intenções, dicas e saves
  i18n/         provider React tipado e interpolação
  locales/      registro, catálogos de UI, atos narrativos e pacotes de chat
  persistence/  IndexedDB, saves com checksum, preferências e diagnóstico
  ui/           boot, celular, apps, caderno, acusação e revelação
scripts/
  validate-locales.mjs
docs/           prompts, resultado narrativo e referências de produção
public/assets/
  art/          pôster e arte de apresentação
  photos/       fotografias de evidência substituíveis
  audio/
    <locale>/   gravações localizadas
```

A aplicação usa React 19, TypeScript, Vite e ícones Lucide.

### Detalhes da interface

- Cursor forense próprio distingue elementos clicáveis, desabilitados e campos de texto.
- Seleção de texto fica desabilitada no aparelho, exceto onde o jogador digita ou copia material relevante.
- Barras de rolagem do celular usam tratamento discreto próprio.
- Novas deduções e mudanças de ato usam avisos narrativos no modo Normal; partidas restauradas não repetem feedback já visto.
- Mensagens recebidas podem mostrar banners no topo do telefone e sons localizados sem reproduzir o histórico restaurado.
- Fotografias abrem em um visualizador com foco preso, fechamento pelo teclado, zoom pela roda e controles e navegação por arrasto.

### Camada de compatibilidade das APIs do Chrome

Todo acesso à IA do navegador fica isolado em `src/ai/`. Os adaptadores normalizam estados atuais e antigos de disponibilidade, tratam progresso como proporção de 0 a 1 em vez de bytes e separam o fim do download da extração e inicialização. A criação do modelo parte de um gesto do usuário; sinais de cancelamento são usados nos prompts, não na instalação de componentes. Apelidos antigos de uso de contexto e overflow também ficam contidos nessa camada para que mudanças futuras não se espalhem pela interface.

## Assets de produção

### Fotografias

Salve a imagem em `public/assets/photos/` usando o nome exato declarado no registro correspondente, por exemplo:

- `IMG_20260308_1944.jpg`
- `tribuna_barao.png`
- `print_live_diego_080326.png`

Se o arquivo não existir, o jogo desenha um placeholder com os metadados corretos. Os 20 prompts de geração estão em [`docs/PRODUCAO-FOTOS.md`](docs/PRODUCAO-FOTOS.md).

### Áudios

Gravações localizadas seguem:

```text
public/assets/audio/<locale>/<VOICE_ID>.m4a
```

Português brasileiro fornece `VOICE_001.m4a` a `VOICE_004.m4a` dentro de `public/assets/audio/pt-BR/`. Não existe fallback para outro idioma. Transcrições cronometradas e localizadas continuam sendo a evidência canônica.

Roteiros e direção estão em [`docs/PRODUCAO-AUDIO.md`](docs/PRODUCAO-AUDIO.md).

Só adicione arquivos que você criou ou possui direito de redistribuir sob a licença deste repositório.

## Adicionar um idioma

Locales são pacotes de conteúdo explícitos e tipados, não uma tradução automática em tempo de execução da interface ou da história.

1. Estenda `LocaleId` e registre os metadados em `src/locales/registry.ts`: nome nativo, BCP-47, idioma do Translator API, idioma do modelo, diretório de áudio e disponibilidade.
2. Implemente o catálogo completo de interface: boot, acessibilidade, erros, opções, aplicativos, caderno e acusação.
3. Implemente os módulos narrativos dos Atos 1–4 preservando IDs de apps, pistas, personagens, bloqueios, memórias, eventos e áudios.
4. Forneça perfis, falas canônicas, expressões de intenção, respostas para nomes inventados e templates de turno.
5. Mantenha em inglês os fatos enviados ao Gemini Nano. Eles são entradas do modelo, não traduções visíveis.
6. Coloque cada áudio em `public/assets/audio/<locale>/` e forneça todas as gravações obrigatórias antes de habilitar o locale.
7. Preserve o carregamento tardio do Ato 4.
8. Para inglês, use o fluxo de identidade existente e não solicite pacotes de tradução desnecessários.
9. Execute `npm run validate:locales` e `npm run build`.
10. Use `enabled: true` somente quando pacote, narrativa, chat e áudios estiverem completos.

Estado atual:

| Locale | Estado | Observação |
|---|---|---|
| `pt-BR` | Jogável | Interface, narrativa, chat e áudios obrigatórios completos. |
| `en-US` | Exemplo desabilitado | Demonstra metadados e contrato inicial; não é uma tradução jogável. |

Nunca misture históricos já traduzidos entre saves de idiomas diferentes.

## Adicionar um personagem de chat

1. Acrescente o identificador estável em `CharacterId`.
2. Defina perfil localizado, prompt de sistema, estilo, falas iniciais e respostas canônicas.
3. Declare os fatos permitidos e suas condições de divulgação.
4. Acrescente gatilhos de entrada tardia às regras determinísticas e ao redutor.
5. Inclua o personagem no seletor ativo ou no estado inicial.
6. Estenda a matriz de nomes permitidos e a validação de locales.

A lista de conversas é gerada pelas definições, sem precisar de uma nova tela codificada manualmente.

## Prompts e resultado narrativo

Os prompts originais usados para construir a história e orientar a primeira implementação estão incluídos junto do resultado narrativo completo. Esses artefatos permanecem em português brasileiro porque o mistério depende da linguagem, instituições, lugares, datas e comportamento de chat do Brasil.

Consulte o [índice dos documentos de produção](docs/README.md), com aviso de spoilers, para acessar:

- prompt de design da história;
- prompt de implementação;
- documento narrativo em cinco partes;
- prompts de fotografias;
- direção de áudio;
- matriz determinística de nomes da IA.

Os documentos ficam fora de `src/` e não são empacotados no aplicativo.

## Segurança e proteção contra spoilers

Esta aplicação roda inteiramente no cliente. Não existe proteção absoluta contra uma pessoa determinada a ler o JavaScript baixado pelo DevTools.

As proteções razoáveis contra spoiler acidental incluem:

- IDs opacos como `CLUE_0xx` e `EVENT_0xx`;
- ausência de texto da solução nos saves;
- estado não exposto globalmente;
- prompts fora do HTML;
- source maps desativados e minificação;
- arquivos separados por ato, com a revelação carregada tarde;
- transições validadas pelo redutor;
- saves validados, sanitizados e assinados.

O projeto não bloqueia botão direito, F12, atalhos nem DevTools. Além de hostis, essas técnicas não protegem segredos no cliente. Sigilo forte exigiria um backend que retivesse o conteúdo e validasse a progressão no servidor, contrariando a proposta local-first.

## Limitações conhecidas

- Prompt API e outras Built-in AI APIs ainda evoluem e podem mudar estados, nomes, assinaturas ou requisitos.
- Não existe fallback em nuvem para dispositivos e navegadores incompatíveis.
- Não há suíte automatizada de testes de interface; validação, TypeScript, build e partida manual são as verificações de lançamento.
- Diálogos generativos variam. Pistas essenciais são entregues de modo determinístico.
- Somente português brasileiro está jogável.
- A arquitetura client-side limita a proteção contra inspeção deliberada.

## Contribuição

Contribuições são bem-vindas. Leia [`CONTRIBUTING.md`](CONTRIBUTING.md) antes de abrir issue ou pull request, principalmente as regras sobre spoilers, IDs estáveis, locales, migrações de save e direitos de assets.

## Licença

Copyright (c) 2026 Wellington Adam.

O código, prompts, narrativa original, documentação e mídias originais deste repositório são publicados sob a [Licença MIT](LICENSE). Contribuidores só podem adicionar materiais que possam ser legalmente distribuídos sob os mesmos termos.
