// Filtro das listas de fichas (funil no título da tabela), com auto-complete em cada campo.
// Usado em Suas fichas (home.html) e Fichas dos jogadores (jogadores.html).
// As sugestões de cada campo são os valores que aparecem nas fichas da própria lista,
// então escolher uma sempre traz resultado. O filtro fica só na tela, não é salvo.
//
// Na página: o botão #botaoFiltro e o painel vazio #painelFiltro (os campos são criados aqui).
// Uso:
//   const filtro = criarFiltro({
//       campos: [
//           { rotulo: 'Nome', placeholder: 'Buscar personagem...', valor: ficha => ficha.nomePersonagem },
//           { rotulo: 'Nível de NEX', placeholder: 'Ex.: 25%', valor: nexDaFicha, numero: true },
//       ],
//       aoMudar: mostrarFichas,
//   });
//   filtro.prepararSugestoes(fichas);   // depois de carregar as fichas
//   fichas.filter(filtro.passa);         // ao mostrar a lista
import { autoComplete } from "./scriptAutoComplete.js";

// "25%" na lista; vazio se a ficha não tem NEX (fichas antigas podem ter "25%" salvo)
export const nexDaFicha = ficha => {
    const nex = String(ficha.nivelNext ?? '').replace(/\D/g, '');
    return nex ? nex + '%' : '';
};

// compara sem maiúsculas e sem acentos: "academico" encontra "Acadêmico"
const normalizar = texto => String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const numero = texto => parseInt(String(texto ?? '').replace(/\D/g, ''), 10);

export function criarFiltro({ campos, aoMudar }) {
    const botao = document.getElementById('botaoFiltro');
    const painel = document.getElementById('painelFiltro');

    // Campos do painel: rótulo + input (o id só serve para o rótulo e a lista de sugestões)
    campos.forEach((campo, i) => {
        const id = 'filtroCampo' + i;
        const rotulo = document.createElement('label');
        rotulo.className = 'rotuloFiltro';
        rotulo.htmlFor = id;
        rotulo.textContent = campo.rotulo;

        campo.input = document.createElement('input');
        campo.input.type = 'text';
        campo.input.id = id;
        campo.input.className = 'campoFiltro';
        campo.input.placeholder = campo.placeholder ?? '';
        campo.input.autocomplete = 'off';
        campo.input.addEventListener('input', mudou);

        painel.append(rotulo, campo.input);
    });

    const limpar = document.createElement('button');
    limpar.type = 'button';
    limpar.className = 'limparFiltro';
    limpar.textContent = 'Limpar filtros';
    limpar.addEventListener('click', () => {
        campos.forEach(campo => campo.input.value = '');
        mudou();
    });
    painel.appendChild(limpar);

    function mudou() {
        // filtro em uso: funil colorido com um pontinho
        botao.classList.toggle('ativo', campos.some(campo => campo.input.value.trim() !== ''));
        aoMudar();
    }

    // Sem foco automático ao abrir: focar um campo já abriria a lista de sugestões por cima do painel
    function abrir(sim) {
        painel.hidden = !sim;
        botao.setAttribute('aria-expanded', String(sim));
    }
    botao.addEventListener('click', () => abrir(painel.hidden));

    // Esc fecha o painel, mas se a lista de sugestões estiver aberta fecha só ela
    let listaAbertaNoEsc = false;
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') listaAbertaNoEsc = !!painel.querySelector('.listaOpcoes.aberta');
    }, true);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !painel.hidden && !listaAbertaNoEsc) { abrir(false); botao.focus(); }
    });
    // Clique fora do painel fecha
    document.addEventListener('click', event => {
        if (!painel.hidden && !painel.contains(event.target) && !botao.contains(event.target)) abrir(false);
    });

    let sugestoesProntas = false;

    return {
        // Sugestões de cada campo: os valores (sem repetir) que aparecem nas fichas
        prepararSugestoes(fichas) {
            if (sugestoesProntas) return;
            sugestoesProntas = true;
            for (const campo of campos) {
                const valores = [...new Set(fichas.map(campo.valor).filter(Boolean))].map(name => ({ name }));
                autoComplete({ campo: campo.input, itens: valores, tipo: campo.rotulo });
            }
        },

        // Texto: contém o que foi digitado. Número (NEX): o mesmo número ("25" ou "25%")
        passa(ficha) {
            return campos.every(campo => {
                const digitado = campo.input.value.trim();
                if (!digitado) return true;
                if (campo.numero) {
                    const procurado = numero(digitado);
                    return Number.isNaN(procurado) || numero(campo.valor(ficha)) === procurado;
                }
                return normalizar(campo.valor(ficha)).includes(normalizar(digitado));
            });
        },
    };
}
