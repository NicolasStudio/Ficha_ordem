const origensInfo = [
    {
        name: 'Acadêmico',
        description: 'Você era um pesquisador ou professor universitário. De forma proposital ou não, seus estudos tocaram em assuntos misteriosos e chamaram a atenção da Ordo Realitas.',
        trainedName: 'Ciências e Investigação',
        trained: {
            'Ciências': true,
            'Investigação': true
        },
        habilitiesName: 'Saber é Poder.',
        habilities: 'Saber é Poder. Uma vez por cena, quando fizer um teste usando Intelecto, você pode gastar 2 PE para receber +5 nesse teste.'
    },
    {
        name: 'Agente de Saúde',
        description: 'Você era um profissional da saúde como um enfermeiro, farmacêutico, médico, psicólogo ou socorrista, treinado no atendimento e cuidado de pessoas. Você pode ter sido surpreendido por um evento paranormal durante o trabalho ou mesmo cuidado de um agente da Ordem em uma emergência, que ficou surpreso com o quão bem você lidou com a situação.',
        trainedName: 'Intuição e Medicina',
        trained: {
            'Intuição': true,
            'Medicina': true
        },
        habilitiesName: 'Técnica Medicinal.',
        habilities: 'Técnica Medicinal. Sempre que cura um personagem, você adiciona seu Intelecto no total de PV curados.'
    },
    {
        name: 'Amnésico',
        description: 'Você perdeu a maior parte da memória. Sabe apenas o próprio nome, ou nem isso. Sua amnésia pode ser resultado de um trauma paranormal ou mesmo de um ritual. Talvez você tenha sido vítima de cultistas? Talvez você tenha sido um cultista? Seja como for, hoje a Ordem é a única família que conhece. Quem sabe, cumprindo missões, você descubra algo sobre seu passado.',
        trainedName: 'Duas à escolha do mestre',
        trained: {}, // definidas pelo mestre
        habilitiesName: 'Vislumbres do Passado.',
        habilities: 'Vislumbres do Passado. Uma vez por missão, você pode fazer um teste de Intelecto (DT 10) para reconhecer pessoas ou lugares familiares, que tenha encontrado antes de perder a memória. Se passar, recebe 1d4 PE temporários e, a critério do mestre, uma informação útil.'
    },
    {
        name: 'Artista',
        description: 'Você era um ator, músico, escritor, dançarino, influenciador... Seu trabalho pode ter sido inspirado por uma experiência paranormal do passado e o que o público acha que é pura criatividade, a Ordem sabe que tem um lado mais sombrio.',
        trainedName: 'Artes e Enganação',
        trained: {
            'Artes': true,
            'Enganação': true
        },
        habilitiesName: 'Magnum Opus.',
        habilities: 'Magnum Opus. Você é famoso por uma de suas obras. Uma vez por missão, pode determinar que um personagem envolvido em uma cena de Interação o reconheça. Você recebe +5 em testes de Diplomacia, Enganação, Intuição e Intimidação contra aquele personagem. A critério do mestre, pode receber esses bônus em outras situações nas quais seria reconhecido.'
    },
    {
        name: 'Atleta',
        description: 'Você competia em um esporte individual ou por equipe, como natação ou futebol. Seu alto desempenho pode ser fruto de alguma influência paranormal que nem mesmo você conhecia ou você pode ter se envolvido em algum evento paranormal em uma de suas competições.',
        trainedName: 'Acrobacia e Atletismo',
        trained: {
            'Acrobacia': true,
            'Atletismo': true
        },
        habilitiesName: '110%.',
        habilities: '110%. Uma vez por cena, quando fizer um teste de perícia usando Força ou Agilidade (exceto testes de ataque) você pode gastar 2 PE para receber +5 nesse teste.'
    },
    {
        name: 'Chef',
        description: 'Você é um cozinheiro amador ou profissional. Talvez trabalhasse em um restaurante, talvez simplesmente gostasse de cozinhar para a família e amigos. Como sua comida fez com que você se envolvesse com o paranormal? Ninguém sabe. Mas os outros agentes adoram quando você vai para a missão!',
        trainedName: 'Fortitude e Profissão (cozinheiro)',
        trained: {
            'Fortitude': true,
            'Profissão': true
        },
        habilitiesName: 'Ingrediente Secreto.',
        habilities: 'Ingrediente Secreto. Em cenas de interlúdio, você pode fazer a ação alimentar-se para cozinhar um prato especial. Você, e todos os membros do grupo que fizeram a ação alimentar-se, recebem o benefício de dois pratos (caso o mesmo benefício seja escolhido duas vezes, seus efeitos se acumulam).'
    },
    {
        name: 'Criminoso',
        description: 'Você vivia uma vida fora da lei, seja como mero batedor de carteiras, seja como membro de uma facção criminosa. Em algum momento, você se envolveu em um assunto da Ordem — talvez tenha roubado um item amaldiçoado? A organização, por sua vez, achou melhor recrutar seus talentos do que ter você como um estorvo.',
        trainedName: 'Crime e Furtividade',
        trained: {
            'Crime': true,
            'Furtividade': true
        },
        habilitiesName: 'O Crime Compensa.',
        habilities: 'O Crime Compensa. No final de uma missão, escolha um item encontrado na missão. Em sua próxima missão, você pode incluir esse item em seu inventário sem que ele conte em seu limite de itens por Prestígio.'
    },
    {
        name: 'Cultista Arrependido',
        description: 'Você fez parte de um culto paranormal. Talvez fossem ignorantes iludidos, que acreditavam estar contatando entidades benevolentes. Talvez soubessem exatamente o que estavam fazendo. Seja como for, algo abriu seus olhos e agora você luta pelo lado certo — embora carregue para sempre traços de sua vida pregressa. Outros membros da Ordem podem desconfiar de sua conversão e você sabe que precisará se esforçar para conquistar a confiança de todos.',
        trainedName: 'Ocultismo e Religião',
        trained: {
            'Ocultismo': true,
            'Religião': true
        },
        habilitiesName: 'Traços do Outro Lado.',
        habilities: 'Traços do Outro Lado. Você possui um poder paranormal à sua escolha. Porém, começa o jogo com metade da Sanidade normal para sua classe.'
    },
    {
        name: 'Desgarrado',
        description: 'Você não vivia de acordo com as normas da sociedade. Podia ser um eremita, uma pessoa em situação de rua ou simplesmente alguém que descobriu o Paranormal e abandonou sua rotina — sabendo o quão frágil era a existência humana, não conseguia simplesmente continuar indo para o trabalho todo o dia. De qualquer forma, a vida sem os confortos modernos o deixou mais forte.',
        trainedName: 'Fortitude e Sobrevivência',
        trained: {
            'Fortitude': true,
            'Sobrevivência': true
        },
        habilitiesName: 'Calejado.',
        habilities: 'Calejado. Você recebe +5 pontos de vida.'
    },
    {
        name: 'Engenheiro',
        description: 'Enquanto os acadêmicos estão preocupados com teorias, você é responsável por colocar a mão na massa, seja como engenheiro profissional, seja como inventor de garagem. Provavelmente você criou algum dispositivo paranormal que chamou a atenção da Ordem.',
        trainedName: 'Profissão e Tecnologia',
        trained: {
            'Profissão': true,
            'Tecnologia': true
        },
        habilitiesName: 'Ferramentas Favoritas.',
        habilities: 'Ferramentas Favoritas. Você pode escolher um kit de perícia e considerar sua categoria como uma abaixo da real (por exemplo, um kit de perícia de categoria II conta como categoria I para você).'
    },
    {
        name: 'Executivo',
        description: 'Você possuía um trabalho de escritório em uma grande empresa, banco ou corporação. Era um administrador, advogado, contador ou de qualquer outra profissão que lida com papelada e burocracia. Sua vida era bastante normal, até que você descobriu algo que não devia. Talvez o sucesso da empresa residisse em um ritual? Talvez toda a corporação fosse fachada para um culto e o presidente, um líder cultista envolvido com entidades paranormais? Após essa descoberta, você foi recrutado pela Ordem e trocou seu trabalho de escritório por missões de campo — hoje, sua vida é tudo, menos normal.',
        trainedName: 'Diplomacia e Profissão',
        trained: {
            'Diplomacia': true,
            'Profissão': true
        },
        habilitiesName: 'Processo Otimizado.',
        habilities: 'Processo Otimizado. Sempre que faz um teste de perícia durante um teste estendido, pode pagar 2 PE para receber +5 nesse teste.'
    },
    {
        name: 'Investigador',
        description: 'Você era um investigador, seja do governo, como um perito forense ou policial federal, seja do setor privado, como um detetive particular. Pode ter tido contato com o Paranormal em algum caso ou ter sido recrutado pela Ordem por suas habilidades de resolução de mistérios.',
        trainedName: 'Investigação e Percepção',
        trained: {
            'Investigação': true,
            'Percepção': true
        },
        habilitiesName: 'Faro para Pistas.',
        habilities: 'Faro para Pistas. Uma vez por cena, quando fizer um teste para procurar pistas, você pode gastar 2 PE para receber +5 nesse teste.'
    },
    {
        name: 'Lutador',
        description: 'Você pratica uma arte marcial ou esporte de luta — boxe, judô, muay thai, karate, jiu-jitsu, MMA... — ou cresceu em uma vizinhança perigosa onde aprendeu briga de rua. Já quebrou muitos ossos, tanto seus quanto dos outros. Pode ter conhecido a Ordem após um torneio secreto envolvendo entidades do Outro Lado ou ter sido recrutado pela sua capacidade de luta.',
        trainedName: 'Luta e Reflexos',
        trained: {
            'Luta': true,
            'Reflexos': true
        },
        habilitiesName: 'Mão Pesada.',
        habilities: 'Mão Pesada. Você recebe +1 em rolagens de dano com ataques corpo a corpo.'
    },
    {
        name: 'Magnata',
        description: 'Você possui muito dinheiro ou patrimônio. Pode ser o herdeiro de uma família antiga ligada ao oculto, ter criado e vendido uma empresa e decidido usar sua riqueza para uma causa maior, ou ter ganho uma loteria após inadvertidamente escolher números amaldiçoados que formavam um ritual.',
        trainedName: 'Diplomacia e Pilotagem',
        trained: {
            'Diplomacia': true,
            'Pilotagem': true
        },
        habilitiesName: 'Patrocinador da Ordem.',
        habilities: 'Patrocinador da Ordem. Seu limite de crédito é sempre considerado um acima do atual.'
    },
    {
        name: 'Mercenário',
        description: 'Você é um soldado de aluguel, que trabalha sozinho ou como parte de alguma organização que vende serviços militares. Escoltas e assassinatos fizeram parte de sua rotina por tempo o suficiente para você se envolver em alguma situação com o Paranormal.',
        trainedName: 'Iniciativa e Intimidação',
        trained: {
            'Iniciativa': true,
            'Intimidação': true
        },
        habilitiesName: 'Posição de Combate.',
        habilities: 'Posição de Combate. No primeiro turno de cada cena de ação, você pode gastar 2 PE para receber uma ação de movimento adicional.'
    },
    {
        name: 'Militar',
        description: 'Você serviu em uma força militar, como o exército ou a marinha. Passou muito tempo treinando com armas de fogo, até se tornar um perito no uso delas. Acostumado a obedecer ordens e partir em missões, está em casa na Ordo Realitas. O inimigo é diferente, mas um tiro bem dado continua resolvendo o problema.',
        trainedName: 'Pontaria e Tática',
        trained: {
            'Pontaria': true,
            'Tática': true
        },
        habilitiesName: 'Para Bellum.',
        habilities: 'Para Bellum. Você recebe +2 em rolagens de dano com armas de fogo.'
    },
    {
        name: 'Operário',
        description: 'Pedreiro, industriário, operador de máquinas em uma fábrica… Você passou uma parte de sua vida em um emprego braçal, desempenhando atividades práticas que lhe deram uma visão pragmática do mundo. Sua rotina mundana, entretanto, foi confrontada de alguma forma pelo paranormal, e você não consegue mais esquecer tudo que viu sobre os mistérios do mundo.',
        trainedName: 'Fortitude e Profissão',
        trained: {
            'Fortitude': true,
            'Profissão': true
        },
        habilitiesName: 'Ferramentas da Profissão.',
        habilities: 'Ferramentas da Profissão. Escolha uma arma simples ou tática que, a critério do mestre, poderia ser usada como ferramenta em sua profissão (como uma marreta para um pedreiro). Você sabe usar a arma escolhida e recebe +2 nas rolagens de dano com ela.'
    },
    {
        name: 'Policial',
        description: 'Você fez parte de uma força de segurança pública, civil ou militar. Em alguma patrulha ou chamado se deparou com um caso paranormal e sobreviveu para contar a história.',
        trainedName: 'Percepção e Pontaria',
        trained: {
            'Percepção': true,
            'Pontaria': true
        },
        habilitiesName: 'Patrulha.',
        habilities: 'Patrulha. Você recebe +1 em Defesa.'
    },
    {
        name: 'Religioso',
        description: 'Você é devoto ou sacerdote de uma fé. Independentemente da religião que pratica, se dedica a auxiliar as pessoas com problemas espirituais. A partir disso, teve contato com o paranormal, o que fez com que fosse convocado pela Ordem.',
        trainedName: 'Religião e Vontade',
        trained: {
            'Religião': true,
            'Vontade': true
        },
        habilitiesName: 'Acalentar.',
        habilities: 'Acalentar. Você pode usar Religião em vez de Diplomacia para fazer a ação acalmar. Além disso, quando acalma uma pessoa, ela fica com 1d6 de Sanidade, em vez de 1.'
    },
    {
        name: 'Servidor Público',
        description: 'Você possuía carreira em um órgão do governo, lidando com burocracia e atendendo pessoas. Sua rotina foi quebrada quando você viu que o prefeito era um cultista ou que a câmara de vereadores se reunia à noite para realizar rituais. Quando os próprios representantes do povo estão dispostos a sacrificá-lo para entidades malignas, onde reside nossa esperança? Hoje, você sabe a resposta para essa pergunta: na Ordo Realitas.',
        trainedName: 'Intuição e Vontade',
        trained: {
            'Intuição': true,
            'Vontade': true
        },
        habilitiesName: 'Espírito Cívico.',
        habilities: 'Espírito Cívico. Sempre que faz um teste para ajudar, você pode gastar 1 PE para aumentar o bônus concedido em +2.'
    },
    {
        name: 'Teórico da Conspiração',
        // "l̶o̶u̶c̶u̶r̶a̶" usa caracteres riscados, como no livro (funciona em qualquer texto, sem HTML)
        description: 'A humanidade nunca pisou na lua. Reptilianos ocupam importantes cargos públicos. A Terra é plana... E secretamente governada pelos Illuminati. Você sabe isso tudo, pois investigou a fundo esses importantes assuntos. Quando sua pesquisa esbarrou no paranormal, você foi recrutado. Na Ordem, sua l̶o̶u̶c̶u̶r̶a̶ determinação será usada para um bom propósito.',
        trainedName: 'Investigação e Ocultismo',
        trained: {
            'Investigação': true,
            'Ocultismo': true
        },
        habilitiesName: 'Eu Já Sabia.',
        habilities: 'Eu Já Sabia. Você não se abala com entidades ou anomalias. Afinal, sempre soube que isso tudo existia. Você recebe resistência a dano mental igual ao seu Intelecto.'
    },
    {
        name: 'T.I.',
        description: 'Programador, engenheiro de software ou simplesmente “o cara da T.I.”, você tem treinamento e experiência para lidar com sistemas informatizados. Seu talento (ou curiosidade exagerada) chamou a atenção da Ordem.',
        trainedName: 'Investigação e Tecnologia',
        trained: {
            'Investigação': true,
            'Tecnologia': true
        },
        habilitiesName: 'Motor de Busca.',
        habilities: 'Motor de Busca. A critério do Mestre, sempre que tiver acesso a internet, você pode gastar 2 PE para substituir um teste de perícia qualquer por um teste de Tecnologia.'
    },
    {
        name: 'Trabalhador Rural',
        description: 'Você trabalhava no campo ou em áreas isoladas, como fazendeiro, pescador, biólogo, veterinário... Você se acostumou com o convívio com a natureza e os animais e talvez tenha ouvido uma ou outra história de fantasmas ao redor da fogueira. Em algum momento da sua vida, porém, descobriu que muitas dessas histórias são verdadeiras.',
        trainedName: 'Adestramento e Sobrevivência',
        trained: {
            'Adestramento': true,
            'Sobrevivência': true
        },
        habilitiesName: 'Desbravador.',
        habilities: 'Desbravador. Você não sofre penalidade em deslocamento e Sobrevivência por clima ruim e por terreno difícil natural.'
    },
    {
        name: 'Trambiqueiro',
        description: 'Uma vida digna exige muito trabalho, então é melhor nem tentar. Você vivia de pequenos golpes, jogatina ilegal e outras falcatruas. Certo dia, enganou a pessoa errada; no dia seguinte, se viu servindo à Ordem. Pelo menos agora tem a chance de usar sua lábia para o bem.',
        trainedName: 'Crime e Enganação',
        trained: {
            'Crime': true,
            'Enganação': true
        },
        habilitiesName: 'Impostor.',
        habilities: 'Impostor. Uma vez por cena, você pode gastar 2 PE para substituir um teste de perícia qualquer por um teste de Enganação.'
    },
    {
        name: 'Universitário',
        description: 'Você era aluno de uma faculdade. Em sua rotina de estudos, provas e festas, acabou descobrindo algo — talvez um livro amaldiçoado na antiga biblioteca do campus? Por seu achado, foi convocado pela Ordem. Agora, estuda com mais afinco: nesse novo curso, ouviu dizer que as provas podem ser mortais.',
        trainedName: 'Atualidades e Investigação',
        trained: {
            'Atualidades': true,
            'Investigação': true
        },
        habilitiesName: 'Empenho.',
        habilities: 'Empenho. Você pode não ter muita experiência, mas compensa com dedicação e esforço. Quando faz um teste de perícia, você pode gastar 2 PE para receber +1d6 nesse teste.'
    },
    {
        name: 'Vítima',
        description: 'Em algum momento de sua vida — infância, juventude ou início da vida adulta — você encontrou o paranormal... E a experiência não foi nada boa. Você viu os espíritos dos mortos, foi atacado por uma entidade ou mesmo foi sequestrado para ser sacrificado em um ritual impedido no último momento. A experiência foi traumática, mas você não se abateu; em vez disso, decidiu lutar para impedir que outros inocentes passem pelo mesmo. E, já tendo sendo vítima do paranormal, se tornou habilidoso em evitar perigos.',
        trainedName: 'Reflexos e Vontade',
        trained: {
            'Reflexos': true,
            'Vontade': true
        },
        habilitiesName: 'Cicatrizes Psicológicas.',
        habilities: 'Cicatrizes Psicológicas. Você recebe +1 de Sanidade para cada 5% de NEX.'
    }
];

export default origensInfo;
