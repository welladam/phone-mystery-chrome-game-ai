# Produção dos vídeos

Material de produção. Fica fora de `src/`, portanto não é empacotado.

Existe **um** vídeo no jogo. Ele é **mudo por definição de formato**: é uma
*foto em movimento*, o trecho que o aparelho grava junto com o disparo, e esse
formato não registra áudio. Isso não é contorno de limitação técnica — é o que
permite que a pista seja um gesto, sem uma sílaba de fala, sem sincronia labial
e sem depender de geração de voz.

Salve o arquivo em `public/assets/videos/` com o **nome indicado no título**. É
esse nome que o jogo procura. Enquanto o arquivo não existir, o jogo desenha um
placeholder com os metadados corretos e mantém a descrição visível — nenhuma
linha de código muda. A descrição objetiva (`alt`, em `src/content/act2.ts`)
tem, num vídeo mudo, a mesma autoridade que a transcrição tem num áudio: ela
aparece sempre, abaixo do player.

---

### 🔴 VIDEO_001 — `IMG_20260308_1152.mp4` · 08/03/2026 11:52 · 3,2 s · **sem áudio**

Pertence à PHOTO_021 (`IMG_20260308_1152.jpg`) e por isso divide o nome-base
com ela: é assim que uma foto em movimento fica no disco. O pôster do player é
a própria PHOTO_021, resolvida da pasta de fotos — não produza um pôster extra.

**Método:** *image-to-video* **a partir da PHOTO_021**, uma tomada. O still é o
quadro do disparo (t=0) e o movimento é o que vem depois. Gerando assim, a
continuidade entre foto e vídeo é automática.

**Obrigatório:** enquadramento imóvel idêntico ao da PHOTO_021; escala legível
na geladeira nos dois primeiros terços; braço em uniforme azul entrando pela
direita; palma cobrindo a lente no último terço.
**Proibido:** áudio; fala; legenda ou texto sobreposto; rosto nítido ou
centralizado; movimento de câmera; corte; música; correção de cor; qualquer
outra pessoa.
**Enquadramento:** vertical 9:16, câmera imóvel apoiada na mesa, altura de
peito sentado.

| t | O que se vê |
|---|---|
| 0,0–1,0 s | Só a mesa servida e a geladeira ao fundo, com a escala presa por ímãs. Ninguém no quadro. |
| 1,0–2,0 s | Entra pela borda direita um antebraço de uniforme hospitalar azul. O rosto aparece cortado pela margem, desfocado, e vira para a lente. |
| 2,0–2,8 s | O braço avança rápido, com borrão de movimento. A escala continua legível ao fundo. |
| 2,8–3,2 s | A palma preenche o quadro. Corta em pele e madeira de mesa. |

> Vídeo curto e realista de câmera de celular, três segundos, uma única tomada,
> enquadramento fixo sem movimento de câmera: cozinha de casa brasileira
> simples ao meio-dia, luz natural de janela. Em primeiro plano, borda de mesa
> com dois pratos de frango com quiabo e uma jarra de suco; ao fundo, geladeira
> branca coberta de ímãs com uma folha de papel A4 impressa presa por um ímã, e
> um relógio de parede marcando 11h52. No primeiro segundo, apenas a mesa e a
> geladeira, sem ninguém. Depois, uma mulher de meia-idade em uniforme
> hospitalar azul entra parcialmente pela borda direita do quadro — apenas
> antebraços, mãos e um rosto desfocado e cortado pela margem, nunca nítido nem
> centralizado. Ela vira a cabeça para a câmera e estende a mão rapidamente na
> direção da lente, com borrão de movimento, até a palma aberta preencher todo
> o quadro; o vídeo termina em pele e madeira de mesa. Ninguém fala. Aparência
> de vídeo amador de celular, leve ruído de sensor, sem música, sem trilha, sem
> legenda, sem texto na tela, sem correção de cor profissional, sem estética
> cinematográfica.

Se a ferramenta exigir prompt em inglês, traduza mantendo as três proibições no
fim: **sem áudio, sem legenda, sem rosto nítido**. Se ela gerar trilha de
qualquer forma, a conversão abaixo descarta com `-an`.

## Conversão

H.264 High, `yuv420p`, 720×1280, 30 fps, CRF 26, **sem faixa de áudio**,
`+faststart` para começar a tocar antes de baixar o arquivo inteiro. Três
segundos nessa configuração ficam em torno de 600 KB.

```bash
ffmpeg -i gerado.mp4 -vf scale=720:1280,fps=30 -c:v libx264 -profile:v high \
  -crf 26 -pix_fmt yuv420p -an -movflags +faststart IMG_20260308_1152.mp4
```

Sem versão WebM: o jogo já exige Chrome 138 ou superior. Teto duro de 8 MB —
é um asset commitado no repositório e servido de `public/`.

## Checklist

1. Produzir a PHOTO_021 primeiro (ver `PRODUCAO-FOTOS.md`).
2. Gerar o vídeo por image-to-video a partir dela.
3. Conferir que a escala continua legível nos dois primeiros terços.
4. Converter com o comando acima, confirmando ausência de faixa de áudio
   (`ffprobe` não deve listar stream de audio).
5. Salvar em `public/assets/videos/IMG_20260308_1152.mp4`.
