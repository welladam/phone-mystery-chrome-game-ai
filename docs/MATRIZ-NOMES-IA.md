# Matriz de nomes permitidos nos chats

Esta lista é a fronteira determinística entre o que pertence ao caso e o que o
jogador inventa durante uma conversa. O arquivo executável correspondente é
`src/content/people.ts`.

| Pessoa | Regina | Théo | Alice | Desconhecida |
|---|---|---|---|---|
| Clara Mendonça Vasques / Cacau | Ato 1 | Ato 1 | Ato 1 | Ato 3 |
| Regina Aparecida Mendonça | Ato 1 | Ato 1 | Ato 1 | Ato 3 |
| Théo Barcellos Ramalho | Ato 1 | Ato 1 | Ato 1 | Ato 3 |
| Alice Bittencourt Fontoura / Lice | Ato 1 | Ato 1 | Ato 1 | Oculta a identidade |
| Wesley Andrade da Silva | Desconhece | Desconhece | Conhece, mas oculta | Ato 3 |
| Diego Andrade da Silva | Desconhece | Desconhece | Ato 3 | Ato 3 |
| Marlene Andrade da Silva | Desconhece | Ato 2 | Conhece, mas oculta | Conhece, mas oculta |
| Dra. Yara Trindade | Ato 2 | Desconhece | Conhece, mas oculta | Ato 3 |
| Lucas Barcellos | Desconhece | Ato 2 | Desconhece | Desconhece |
| Delegado Ubiratan Peçanha | Ato 1 | Ato 1 | Ato 1 | Ato 3 |
| Anselmo Vasques | Ato 1 | Ato 1 | Ato 1 | Desconhece |
| José Nilton / Zé do Bloco | Desconhece | Ato 2 | Conhece, mas oculta | Ato 3 |
| Nayara / Nau | Desconhece | Desconhece | Ato 1 | Desconhece |
| Dr. Rangel | Ato 1 | Ato 1 | Ato 1 | Desconhece |
| Tia Sônia | Ato 1 | Desconhece | Ato 1 | Desconhece |
| Fumaça | Ato 1 | Ato 1 | Ato 1 | Desconhece |

## Comportamento

- Nome ausente da lista, como **Jonas**, recebe uma resposta canônica de
  desconhecimento na voz do personagem e não é enviado ao modelo como fato.
- Nome canônico ainda indisponível recebe o mesmo tratamento, evitando spoiler.
- Nome que o personagem conhece mas precisa esconder produz uma negativa
  coerente, sem revelar pelo comportamento que o reconheceu.
- Fatos liberados pela máquina de estados têm prioridade sobre a tabela. Isso
  permite que uma pessoa passe a ser discutida quando a investigação realmente
  fornecer esse nome ao personagem.
- O prompt ainda trata relações e acusações do jogador como alegações não
  confirmadas. A lista é a proteção determinística; o prompt é uma segunda
  camada.
