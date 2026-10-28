// Informações dos campos de Saúde, Defesas e Resistências da ficha.
// campo: o "name" do input onde aparece o "i"
// formula: opcional, mostrada como "Cálculo." no modal
const infoGeral = [
    // ---------- Saúde ----------
    {
        campo: 'pv_atual',
        name: 'Pontos de Vida Atual',
        description: 'Vida perdida.'
    },
    {
        campo: 'pv_total',
        name: 'Pontos de Vida Máxima',
        description: 'Vida total.',
        formula: 'Valor da classe + VIG'
    },
    {
        campo: 'pe_atual',
        name: 'Pontos de Esforço Atual',
        description: 'Esforço perdido.'
    },
    {
        campo: 'pe_total',
        name: 'Esforço Máximo',
        description: 'Esforço total.',
        formula: 'Valor da classe + PRE'
    },
    {
        campo: 'san_atual',
        name: 'Pontos de Sanidade Atual',
        description: 'Sanidade perdida.'
    },
    {
        campo: 'san_total',
        name: 'Sanidade Máxima',
        description: 'Sanidade total.',
        formula: 'Valor da classe'
    },

    // ---------- Defesas ----------
    {
        campo: 'defesa_passiva',
        name: 'Passiva',
        description: 'Defesa padrão para ataques comuns, surpresa ou oportunidade.',
        formula: 'Defesa = 10 + AGI (5 + AGI se estiver sobrecarregado)'
    },
    {
        campo: 'defesa_bloquear',
        name: 'Bloqueio',
        description: 'Se for treinado em Fortitude, quando for alvo de um ataque corpo a corpo, você pode usar uma reação para bloquear. Se fizer isso, você recebe resistência a dano igual ao seu modificador de Fortitude contra este ataque.',
        formula: 'Defesa = 10 + Fortitude (5 + Fortitude se estiver sobrecarregado)'
    },
    {
        campo: 'defesa_esquiva',
        name: 'Esquiva',
        description: 'Se for treinado em Reflexos, quando for alvo de um ataque, você pode usar uma reação para esquivar. Se fizer isso, você adiciona seu modificador de Reflexos em sua Defesa contra este ataque.',
        formula: 'Defesa = 10 + Reflexos (5 + Reflexos se estiver sobrecarregado)'
    },

    // ---------- Resistências ----------
    {
        campo: 'resistenciaFisica',
        name: 'Física',
        description: 'Proteções físicas, como armaduras, escudos e barreiras. Protege contra ataques físicos, como armas brancas e ataques corpo a corpo.'
    },
    {
        campo: 'resistenciaBalistica',
        name: 'Balística',
        description: 'Proteções balísticas, como coletes e escudos. Protege contra ataques de armas de fogo, flechas ou outros tipos de projéteis.'
    },
    {
        campo: 'resistenciaSanidade',
        name: 'Sanidade',
        description: 'Proteções mentais, como resistência a manipulação, controle mental e ataques psíquicos. Protege contra ataques que afetam a mente e a sanidade do personagem.'
    }
];

export default infoGeral;
