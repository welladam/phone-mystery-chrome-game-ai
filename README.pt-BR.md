# O Mistério de Clara

[English](README.md) · [Português (Brasil)](README.pt-BR.md) · [Documentação completa](README_FULL.pt-BR.md)

<p align="center">
  <img src="public/assets/art/clara-poster-v2.png" alt="Pôster de O Mistério de Clara" width="512">
</p>

[Jogar online](https://welladam.github.io/phone-mystery-chrome-game-ai/) · [Documentação completa](README_FULL.pt-BR.md)

Um mistério open source para navegador, movido pela IA local do Chrome. Você recebe o celular de uma jovem cuja morte foi tratada como provável suicídio. Explore os aplicativos, recupere evidências escondidas, converse com as pessoas próximas a ela e descubra o que realmente aconteceu.

> **Protótipo jogável · v0.1.0 · Português brasileiro**

## 100% criado por IA

O código, mistério, personagens, diálogos, documentação, imagens, artes e áudios foram criados com inteligência artificial.

Este é um projeto **100% vibe coding, construído com Codex e Claude**. A direção humana definiu as ideias, selecionou resultados, avaliou o jogo em execução e pediu cada revisão; a IA produziu a implementação e o material criativo.

Os prompts originais e resultados narrativos estão publicados em [`docs/`](docs/README.md).

## O que existe no jogo

- Uma investigação fair play de **90–150 minutos** contada por um celular simulado.
- **20 aplicativos**, um caderno externo, **72 pistas**, **9 senhas** e **quatro atos**.
- Três conversas com IA desde o início e um quarto contato anônimo introduzido pela história.
- Sessões, históricos, personalidades e limites de conhecimento separados por personagem.
- Modo Normal com deduções e dicas e modo Difícil sem auxílio investigativo.
- Fotos, gravações, e-mails, chats, mapas, histórico, dados de saúde, arquivos apagados e outras evidências digitais.
- Saves, notas, acessibilidade, som e progresso independente por idioma.

A história aborda morte, luto, coação, culpa e violência sem descrição gráfica. Recomendada para maiores de 16 anos.

## APIs de IA do Chrome utilizadas

- **[Prompt API for Gemini Nano](https://developer.chrome.com/docs/ai/prompt-api):** executa cada personagem localmente em uma sessão de conversa isolada. O Gemini Nano é baixado e administrado pelo Chrome; este projeto não chama a API Gemini na nuvem.
- **[Translator API](https://developer.chrome.com/docs/ai/translator-api):** traduz as mensagens em português para inglês antes da inferência e traduz as respostas de volta. Os pacotes de idioma também são baixados e executados localmente.

Não existe backend, inferência na nuvem, chave de API, extensão, analytics ou conta de jogador.

### Como funciona

A IA interpreta os personagens; ela não controla o mistério.

```text
mensagem do jogador
  → tradução local para inglês
  → sessão isolada do personagem no Gemini Nano
  → tradução local para o idioma ativo
```

O motor determinístico decide quais fatos cada personagem pode receber, quais pistas foram examinadas, se uma senha está correta, quando um ato avança e como o jogo termina. Pistas essenciais usam respostas canônicas escritas manualmente para que a variação do modelo não torne o mistério injusto.

O motor do jogo continua controlando fatos, senhas, progressão e desfecho; o Gemini Nano apenas interpreta os personagens.

## Como preparar o Chrome

1. Atualize o **Google Chrome para computador para a versão 148 ou superior** em `chrome://settings/help`.
2. Confira os requisitos de hardware e armazenamento abaixo e use uma conexão sem limite de dados no primeiro download.
3. Abra o [jogo online](https://welladam.github.io/phone-mystery-chrome-game-ai/) ou execute pelo `localhost`. Não abra o `index.html` usando `file://`.
4. Quando o jogo solicitar, selecione **Aceitar e iniciar download**. Mantenha a aba aberta enquanto o Chrome baixa o Gemini Nano e os pacotes de tradução português/inglês.
5. Nas próximas visitas, o Chrome normalmente reutiliza esses componentes. O estado deles pode ser consultado em `chrome://on-device-internals`.

No Chrome 148+ normalmente não é necessário instalar o modelo manualmente, usar extensão, criar chave de API ou habilitar flag experimental. Parâmetros de amostragem podem ter disponibilidade experimental separada, mas este projeto não depende deles.

## Requisitos

- Google Chrome **148+ no computador**
- Windows 10/11, macOS 13+, Linux ou Chromebook Plus compatível
- Aproximadamente 22 GB livres no volume do perfil do Chrome
- Mais de 4 GB de VRAM, ou pelo menos 16 GB de RAM e 4 núcleos de CPU
- Conexão sem limite para o primeiro download dos modelos
- `localhost`, `127.0.0.1` ou HTTPS

Chrome para celular e outros navegadores não são compatíveis com as APIs de modelo usadas. Consulte o [guia completo de configuração e diagnóstico](README_FULL.pt-BR.md#como-preparar-o-chrome).

## Rodar localmente

```bash
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite, normalmente [http://127.0.0.1:5173](http://127.0.0.1:5173).

Verificação de produção:

```bash
npm run build
npm run preview
```

## Idiomas

| Locale | Estado |
|---|---|
| `pt-BR` | Completo e jogável |
| `en-US` | Exemplo incompleto para contribuidores; desabilitado |

Interface, história, falas canônicas, intenções, proteção de nomes, saves e áudios são separados por locale. Leia [como adicionar um idioma](README_FULL.pt-BR.md#adicionar-um-idioma).

## Saiba mais

- [Documentação completa](README_FULL.pt-BR.md) — arquitetura, boot, proteções da IA, persistência, assets, idiomas, personagens, segurança e diagnóstico.
- [Documentos de produção](docs/README.md) — prompts originais, resultado narrativo em cinco partes, briefs de fotos, direção de áudio e matriz de nomes. **Contém spoilers completos.**
- [Guia de contribuição](CONTRIBUTING.md) — desenvolvimento, IDs narrativos, locales, direitos dos assets e tratamento de spoilers.

## Licença

Copyright (c) 2026 Wellington Adam.

Código, prompts, narrativa original, documentação e mídias originais são publicados sob a [Licença MIT](LICENSE).
