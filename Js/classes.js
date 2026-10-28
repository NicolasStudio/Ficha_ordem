// description: parágrafos separados por linha em branco (\n\n)
const classesInfo = [
    {
        name: 'Combatente',
        briefing: 'Treinado para lutar com todo tipo de armas, e com a força e a coragem para encarar os perigos de frente, É o tipo de agente que prefere abordagens mais diretas e costuma atirar primeiro e perguntar depois.',
        description: 'Do mercenário especialista em armas de fogo até o perito em espadas, combatentes apresentam uma gama enorme de habilidades e técnicas especiais que aprimoram sua eficiência no campo de batalha, tornando-os membros essenciais em qualquer missão de extermínio.\n\nAlém de treinar seu corpo, o combatente também é perito em liderar seus aliados em batalha e cuidar de seu equipamento de combate, sempre preparado para assumir a linha de frente quando a coisa fica feia.',
        life: '20 + VIG',
        lifeDetails: 'A cada novo nível de exposição 4 PV + VIG',
        effort: '2 + PRE',
        effortDetails: 'A cada novo nível de exposição 2 PE + PRE',
        sanity: '12',
        sanityDetails: 'A cada novo nível de exposição 3 PS',
        trainedName: 'Luta ou Pontaria (uma das duas) e Fortitude ou Reflexos (uma das duas), mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto.'
    },
    {
        name: 'Especialista',
        briefing: 'Um agente que confia mais em esperteza do que em força bruta. Um especialista se vale de conhecimento técnico, raciocínio rápido ou mesmo lábia para resolver mistérios e enfrentar o paranormal.',
        description: 'Cientistas, inventores, pesquisadores e técnicos de vários tipos são exemplos de especialistas, que são tão variados quanto as áreas do conhecimento e da tecnologia. Alguns ainda preferem estudar engenharia social e se tornam excelentes espiões infiltrados, ou mesmo estudam técnicas especiais de combate como artes marciais e tiro a distância, aliando conhecimento técnico e habilidade.\n\nO que une todos os especialistas é sua incrível capacidade de aprender e improvisar usando seu intelecto e conhecimento avançado, que pode tirar o grupo todo dos mais diversos tipos de enrascadas.',
        life: '16 + VIG',
        lifeDetails: 'A cada novo nível de exposição 3 PV + VIG',
        effort: '3 + PRE',
        effortDetails: 'A cada novo nível de exposição 3 PE + PRE',
        sanity: '16',
        sanityDetails: 'A cada novo nível de exposição 4 PS',
        trainedName: 'Uma quantidade de perícias à sua escolha igual a 7 + Intelecto.'
    },
    {
        name: 'Ocultista',
        briefing: 'O Outro Lado é misterioso, perigoso e, de certa forma, cativante. Muitos estudiosos das Entidades se perdem em seus reinos obscuros em busca de poder, mas existem aqueles que visam compreender e dominar os mistérios paranormais para usá-los para combater o próprio Outro Lado. Esse tipo de agente não é apenas um conhecedor do oculto, como também possui talento para se conectar com Elementos paranormais.',
        description: 'Ao contrário da crendice popular, ocultistas não são intrinsecamente malignos. Seria como dizer que o cientista que inventou a pólvora é culpado pelo assassino que disparou o revólver. Para a Ordem, o Paranormal é uma força que pode ser usada para os mais diversos propósitos, de acordo com a intenção de seu usuário.\n\nOcultistas aplicam seu conhecimento acadêmico e suas capacidades de conjuração de rituais em missões para investigar e combater o Paranormal em todas as suas formas, principalmente quando munição convencional não é o suficiente para lidar com a tarefa.',
        life: '12 + VIG',
        lifeDetails: 'A cada novo nível de exposição 2 PV + VIG',
        effort: '4 + PRE',
        effortDetails: 'A cada novo nível de exposição 4 PE + PRE',
        sanity: '20',
        sanityDetails: 'A cada novo nível de exposição 5 PS',
        trainedName: 'Ocultismo e Vontade, mais uma quantidade de perícias a sua escolha igual a 3 + Intelecto.'
    }
];

export default classesInfo;
