<papel>
A partir de agora, mude seu papel.

Você é um engenheiro de software sênior especializado em:

- desenvolvimento de aplicações web com React, TypeScript e Vite;
- jogos narrativos e experiências investigativas;
- máquinas de estado e progressão não linear;
- Chrome Built-in AI;
- Prompt API com Gemini Nano;
- Translator API do Chrome;
- persistência local com IndexedDB e localStorage;
- interfaces que simulam sistemas operacionais e celulares;
- segurança e proteção de conteúdo em aplicações executadas no navegador;
- acessibilidade, animações e tratamento de falhas.

Sua tarefa é construir o projeto completo. Não produza apenas sugestões, pseudocódigo, wireframes ou um plano conceitual.

Trabalhe diretamente nos arquivos do repositório existente.
</papel>

<fonte_narrativa>
A história de mistério criada anteriormente nesta conversa é a fonte narrativa oficial do projeto.

Transforme essa história em uma experiência jogável.

Preserve:

- personagens;
- identidade do responsável pela morte de Clara;
- motivo e método;
- cronologia;
- pistas;
- contradições;
- senhas;
- aplicativos;
- fotografias;
- mensagens;
- e-mails;
- eventos;
- progressão;
- revelação final.

Não reescreva ou simplifique a história sem necessidade técnica.

Se o protótipo atual possuir conteúdos temporários que contradigam a história definitiva, substitua-os. Isso inclui qualquer final antigo no qual Clara esteja viva ou qualquer pista experimental que não pertença mais à história oficial.
</fonte_narrativa>

<descricao_do_jogo>
O projeto é um jogo de investigação executado inteiramente no navegador.

O jogador é um investigador examinando a morte de Clara. Ele recebe o celular da vítima e precisa explorar seus aplicativos para descobrir o que aconteceu.

O celular contém aplicativos fictícios, incluindo:

- Chat;
- Fotos;
- E-mail;
- Agenda;
- Calendário;
- Navegador e histórico;
- Ligações;
- Notas;
- Mapas;
- Arquivos;
- Lixeira;
- outros aplicativos definidos na história.

O jogador precisa:

- descobrir pistas;
- encontrar relações entre informações;
- perceber contradições;
- solucionar senhas;
- desbloquear aplicativos e arquivos;
- conversar com personagens;
- reconstruir os acontecimentos;
- apresentar uma acusação final.

A investigação termina quando o jogador apresenta uma solução válida e o jogo revela completamente o mistério.
</descricao_do_jogo>

<chats_com_ia>
O aplicativo de Chat possui inicialmente três contatos controlados por IA:

- mãe de Clara;
- namorado de Clara;
- Alice, melhor amiga de Clara.

Em um ponto definido pela história, surge uma quarta conversa:

- Desconhecida.

Cada personagem deve usar uma sessão independente do Prompt API.

Os contextos nunca podem ser misturados:

- cada personagem possui seu próprio histórico;
- cada personagem recebe seu próprio prompt de sistema;
- cada personagem conhece somente os fatos permitidos pela história;
- um personagem não recebe mensagens trocadas com outro;
- pistas descobertas em outros aplicativos somente chegam ao personagem quando isso for narrativamente permitido;
- a Desconhecida não existe no aplicativo antes do gatilho correto.

A personalidade de cada personagem deve existir integralmente desde a primeira mensagem.

Não implemente sistema de confiança, pontos de afinidade ou mudança gradual de personalidade.

Os personagens podem esconder informações por seus próprios motivos narrativos, mas a personalidade não deve depender de pontuação.

O código do jogo, e não a IA, deve controlar:

- pistas desbloqueadas;
- eventos;
- senhas;
- progressão;
- revelações permitidas;
- entrada da Desconhecida;
- condições do final.

Nunca envie para uma sessão de IA informações que o personagem ainda não pode revelar. Essa é a principal proteção contra vazamento narrativo.

A IA representa o personagem e interpreta perguntas, mas não decide sozinha se uma pista foi encontrada ou se a investigação avançou.
</chats_com_ia>

<idioma_e_traducao>
Toda a experiência visual deve permanecer em português brasileiro.

Use o seguinte fluxo para as conversas:

1. O jogador escreve em português.
2. A Translator API traduz português para inglês localmente.
3. O texto em inglês é enviado à sessão do personagem no Prompt API.
4. A IA responde em inglês.
5. A Translator API traduz a resposta para português.
6. Apenas a resposta em português aparece para o jogador.

Os prompts internos dos personagens podem estar em inglês para melhorar a interpretação de personalidade e emoção.

As traduções não devem aparecer na interface.

Preserve nas respostas:

- emoção;
- hesitação;
- pausas;
- correções;
- pontuação;
- frases fragmentadas;
- maneira individual de escrever;
- eventuais emojis definidos para o personagem.

Não use serviços externos de tradução e não solicite chaves de API.
</idioma_e_traducao>

<verificacao_atual>
Antes de implementar a integração, consulte a documentação oficial atual do Chrome sobre:

- Prompt API;
- Translator API;
- disponibilidade dos modelos;
- idiomas suportados;
- eventos de download;
- requisitos de ativação pelo usuário;
- contexto seguro;
- destruição de sessões;
- tratamento de erros.

Não suponha que uma API experimental permanece com a mesma assinatura. Encapsule as APIs do navegador em adaptadores próprios para facilitar futuras mudanças.
</verificacao_atual>

<inicializacao_do_celular>
O celular não pode ligar antes de todos os componentes obrigatórios estarem disponíveis e prontos.

Crie uma experiência de inicialização semelhante ao primeiro boot de um celular recuperado.

O fluxo deve ser:

1. Celular desligado.
2. Jogador escolhe “Ligar e inicializar”.
3. Aplicação verifica contexto seguro.
4. Aplicação verifica suporte ao Prompt API.
5. Aplicação verifica suporte ao Translator API.
6. Aplicação verifica o modelo de conversa.
7. Aplicação verifica a tradução português → inglês.
8. Aplicação verifica a tradução inglês → português.
9. Se houver download necessário, explica o que será baixado.
10. O download só começa após interação explícita do jogador.
11. A interface acompanha o progresso em tempo real.
12. Os componentes são inicializados.
13. Uma verificação curta confirma que conversa e tradução estão funcionando.
14. Somente depois de tudo estar pronto, o celular termina de ligar.
15. O jogo restaura a progressão e abre a interface principal.

Não permita entrar no celular enquanto algum componente estiver:

- ausente;
- incompatível;
- aguardando autorização;
- baixando;
- inicializando;
- sendo verificado;
- em estado de erro.

Não crie um botão de modo demo que permita ignorar essa inicialização na versão principal.
</inicializacao_do_celular>

<feedback_em_tempo_real>
O jogador nunca deve ficar olhando para uma tela parada sem saber o que está acontecendo.

Mostre etapas como:

- “Verificando compatibilidade do navegador...”
- “Verificando o modelo de conversa...”
- “Verificando tradução para inglês...”
- “Verificando tradução para português...”
- “Preparando componentes locais...”
- “Baixando modelo de conversa...”
- “Baixando pacote de tradução...”
- “Instalando componentes...”
- “Inicializando a inteligência do aparelho...”
- “Verificando comunicação...”
- “Restaurando dados da investigação...”
- “Celular pronto.”

Quando a API fornecer porcentagem real, mostre:

- porcentagem;
- barra de progresso;
- nome do componente;
- etapa atual.

Quando não houver porcentagem real, use um indicador indeterminado. Não invente uma porcentagem falsa.

A interface deve continuar responsiva durante downloads e inicializações.

Se o download for interrompido, preserve a progressão narrativa e permita tentar novamente.
</feedback_em_tempo_real>

<tratamento_de_erros>
Crie mensagens específicas, humanas e acionáveis para pelo menos:

- navegador incompatível;
- versão antiga do Chrome;
- dispositivo sem suporte;
- Prompt API ausente;
- Translator API ausente;
- contexto inseguro;
- modelo indisponível;
- download ainda não autorizado;
- download interrompido;
- falha na tradução português → inglês;
- falha na tradução inglês → português;
- falha na sessão de um personagem;
- estouro ou esgotamento do contexto;
- erro ao restaurar o progresso;
- armazenamento local bloqueado;
- falta de espaço indicada pelo navegador;
- perda de conexão durante o primeiro download;
- componente removido pelo navegador;
- erro desconhecido.

Cada erro deve oferecer, quando fizer sentido:

- explicação curta;
- possível causa;
- ação recomendada;
- botão “Tentar novamente”;
- opção de recarregar;
- indicação de que a progressão continua salva.

Não exponha mensagens técnicas, stack traces ou exceções diretamente ao jogador.

Crie uma área de diagnóstico separada, acessível somente por uma opção de desenvolvimento, contendo códigos técnicos que possam ser exportados.
</tratamento_de_erros>

<persistencia>
A progressão deve continuar salva quando o jogador:

- fechar a aba;
- fechar o navegador;
- atualizar a página;
- retornar ao mesmo link;
- desligar e ligar o computador;
- interromper um download.

Use preferencialmente IndexedDB para o estado principal. Use localStorage apenas para preferências pequenas ou indicadores simples.

Salve:

- versão do formato do save;
- ato atual;
- aplicativos desbloqueados;
- arquivos desbloqueados;
- pistas encontradas;
- pistas examinadas;
- senhas solucionadas;
- histórico de cada chat;
- eventos disparados;
- entrada da Desconhecida;
- estado de cada conversa;
- notificações já exibidas;
- mensagens já recebidas;
- progresso da acusação;
- configurações de acessibilidade;
- data do último salvamento.

O salvamento deve acontecer automaticamente depois de ações relevantes.

Implemente migração de versões para evitar que uma atualização simples destrua um progresso existente.

Ao retornar ao jogo:

1. Verifique novamente os componentes de IA.
2. Não abra o celular enquanto eles não estiverem prontos.
3. Depois da inicialização, restaure exatamente a tela e o progresso anterior.
4. Informe discretamente que a investigação foi restaurada.

Não armazene textos completos da solução ou segredos ainda bloqueados dentro do save.
</persistencia>

<estado_narrativo>
Implemente uma máquina de estados central e determinística.

Toda ação deve passar pelo motor do jogo:

- abrir aplicativo;
- visualizar foto;
- examinar metadados;
- ler mensagem;
- descobrir pista;
- inserir senha;
- conversar com personagem;
- disparar notificação;
- receber mensagem da Desconhecida;
- avançar ato;
- realizar acusação.

A interface não deve desbloquear conteúdo apenas alterando um estado visual local.

Valide pré-requisitos antes de aceitar qualquer progressão.

Use IDs estáveis para pistas, eventos, aplicativos, arquivos, conversas e bloqueios.

A IA nunca deve modificar diretamente o estado narrativo.
</estado_narrativo>

<interface>
A interface deve simular um celular real pertencente a Clara.

Crie:

- tela de inicialização;
- tela bloqueada;
- tela inicial;
- grade de aplicativos;
- central de notificações;
- aplicativos navegáveis;
- navegação de voltar;
- indicadores de conteúdo novo;
- tela de senha;
- aplicativo de Chat;
- visualizador de fotos;
- leitor de e-mails;
- histórico do navegador;
- agenda e calendário;
- tela de acusação final.

Evite aparência de painel administrativo ou dashboard genérico.

A experiência precisa funcionar com mouse e teclado, além de se adaptar a telas menores quando possível.
</interface>

<animacoes>
Use animações quando elas ajudarem a criar sensação de celular e suspense.

Exemplos:

- sequência de boot;
- surgimento progressivo das etapas de inicialização;
- barra de download;
- transição da tela bloqueada para a tela inicial;
- abertura e fechamento de aplicativos;
- notificações chegando;
- indicador de personagem digitando;
- chegada inesperada da Desconhecida;
- desbloqueio de pista;
- erro de senha;
- revelação final.

As animações devem ser curtas e não bloquear ações desnecessariamente.

Respeite `prefers-reduced-motion`.

Não use animações apenas como decoração se elas prejudicarem a leitura ou atrasarem a investigação.
</animacoes>

<fotografias_e_audios>
Use placeholders bem apresentados para imagens e áudios ainda não produzidos.

Crie uma estrutura de assets que permita substituir cada placeholder manualmente sem alterar a lógica do jogo.

Cada asset deve ser associado ao ID definido na história.

Preserve os prompts de geração de imagem fornecidos no documento narrativo em um arquivo de produção separado, não visível dentro do jogo.
</fotografias_e_audios>

<protecao_contra_devtools>
A aplicação roda inteiramente no navegador. Portanto, não existe proteção absoluta contra alguém determinado a inspecionar o código pelo DevTools.

Implemente proteção best-effort contra spoilers e alterações casuais, sem afirmar que o cliente é inviolável.

Use estas medidas:

- não coloque a solução completa em localStorage;
- armazene no save somente IDs e estados já alcançados;
- não envie segredos bloqueados para as sessões de IA;
- divida o conteúdo narrativo por atos ou pacotes;
- carregue conteúdos futuros somente quando forem necessários;
- não exponha nomes como `assassino`, `culpado` ou `solucao_final` em chaves públicas;
- use IDs neutros e opacos nos dados de produção;
- desative source maps no build de produção;
- use minificação de produção;
- valide toda transição pela máquina de estados;
- valide e sanitize saves carregados;
- mantenha versão e checksum de integridade do save;
- detecte alterações inválidas de progressão;
- mantenha prompts de produção fora de elementos HTML;
- não exponha o estado completo em variáveis globais;
- não publique ferramentas de diagnóstico no build final;
- considere carregar pacotes narrativos de forma incremental;
- se usar ofuscação, mantenha-a isolada do código principal e não sacrifique estabilidade.

Não use técnicas hostis ou ineficazes como:

- bloquear clique direito;
- bloquear F12;
- interceptar atalhos do navegador;
- loops com `debugger`;
- recarregar a página ao detectar DevTools;
- apagar o progresso do jogador;
- alegar que a história está protegida de forma absoluta.

Documente no README que segurança real contra inspeção exigiria um backend que não enviasse antecipadamente os segredos ao navegador.
</protecao_contra_devtools>

<documentacao>
Crie ou atualize o README em português.

Explique claramente:

1. O que é o jogo.
2. Como funciona a investigação.
3. Como a IA é utilizada.
4. Como a tradução funciona.
5. Quais dados permanecem no dispositivo.
6. Quais são os requisitos do navegador.
7. Como instalar as dependências do projeto.
8. Como rodar localmente.
9. Por que localhost ou HTTPS é necessário.
10. Como gerar o build de produção.
11. Como substituir fotografias e áudios.
12. Como limpar ou migrar o progresso salvo.
13. Limitações da proteção contra DevTools.
14. Limitações atuais das APIs experimentais do Chrome.
15. Como adicionar futuramente um novo personagem de chat.

Também crie uma explicação curta dentro do próprio jogo, antes da inicialização, para usuários que não são desenvolvedores.
</documentacao>

<restricoes>
Não crie testes automatizados.

Não implemente suíte de testes, mocks de teste, Playwright, Cypress, Vitest ou arquivos de teste.

Não gaste tokens produzindo um relatório de testes.

Faça apenas uma verificação mínima de compilação ao final, se necessária para garantir que o projeto possa ser executado.

Não instale bibliotecas grandes quando uma solução simples em TypeScript, React ou CSS for suficiente.

Não substitua a arquitetura atual sem necessidade.

Preserve mudanças existentes que não contradigam a história definitiva.
</restricoes>

<modo_de_execucao>
Siga esta ordem:

1. Inspecione o projeto atual.
2. Identifique a estrutura e os recursos já implementados.
3. Use a história anterior como especificação narrativa.
4. Consulte apenas a documentação oficial necessária das APIs do Chrome.
5. Implemente o projeto diretamente nos arquivos.
6. Substitua conteúdos temporários incompatíveis com a história.
7. Crie a máquina de estados.
8. Implemente a persistência.
9. Implemente a inicialização e os downloads.
10. Implemente os aplicativos.
11. Implemente os quatro chats independentes.
12. Implemente a acusação e a revelação final.
13. Atualize o README.
14. Faça uma verificação mínima de compilação.
15. Entregue um resumo curto do que foi construído.

Não pare depois de apresentar um plano.

Não peça confirmação entre etapas.

Quando uma decisão pequena não estiver especificada, escolha a opção mais coerente com a história e continue.

Somente faça uma pergunta se existir um bloqueio real que impeça a implementação.
</modo_de_execucao>

<resultado_esperado>
Ao terminar, o repositório deve conter uma primeira versão completa e jogável da investigação.

O jogador deve conseguir:

- abrir o link;
- entender o que é a experiência;
- verificar e baixar os componentes necessários;
- acompanhar todos os downloads;
- entender qualquer erro;
- ligar o celular somente quando tudo estiver pronto;
- retomar uma investigação salva;
- explorar os aplicativos;
- conversar separadamente com os personagens;
- descobrir senhas;
- coletar pistas;
- receber contato da Desconhecida;
- formular uma acusação;
- revelar o mistério;
- concluir o jogo.
</resultado_esperado>

<tarefa>
Comece agora.

Construa a aplicação completa no repositório atual usando a história criada anteriormente como fonte oficial.

Implemente os arquivos necessários em vez de apenas mostrar exemplos de código.
</tarefa>