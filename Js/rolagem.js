// Rolagem de dano com um clique: botões 🎲 Base e 💥 Crítico ao lado de um campo de texto.
// Usado pelas armas da ficha (scriptArmas.js) e pelos ataques da criatura (scriptAtaquesCriatura.js);
// cada um diz como ler a própria linha (função "ler"). Formatos travados:
//   Dano:    dados e números com + e -, e atributos (FOR, AGI, INT, PRE, VIG): "1d8+FOR", "2d8+6"
//   Crítico: margem/multiplicador "19/x2" (multiplica só os dados, como no livro), só "x3",
//            só a margem "19" (x2), dano máximo "18/max" ("dano full"), ou um dano próprio
//            "3d8+FOR" (também "19/3d8+FOR"); vazio ou "-" = sem crítico
// Dentro da mesa (Tabletop) a rolagem vai para a mesa, pública: dados 3D e, no histórico,
// um cartão com personagem, o que foi rolado, a conta e o total. Fora dela, rola aqui.
import { ORIGENS_DA_MESA, dentroDaMesa } from "./scriptFirebase.js";
import { modalInformacao } from "./scriptModal.js";

const LADOS = new Set([4, 6, 8, 10, 12, 20, 100]);

// Atributos aceitos nas fórmulas -> campo da ficha (sem acento e sem diferenciar maiúsculas)
const ATRIBUTOS = {
    for: 'forca', forca: 'forca',
    agi: 'agilidade', agilidade: 'agilidade',
    int: 'inteligencia', intelecto: 'inteligencia', inteligencia: 'inteligencia',
    pre: 'presenca', presenca: 'presenca',
    vig: 'vigor', vigor: 'vigor'
};
const SIGLAS = { forca: 'FOR', agilidade: 'AGI', inteligencia: 'INT', presenca: 'PRE', vigor: 'VIG' };

const semAcento = texto => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const valorDoAtributo = campo => Number(document.getElementById(campo)?.value) || 0;

// "1d8+FOR-1" -> [{ sinal, tipo: 'dado', qtd, lados } | { tipo: 'num', valor } | { tipo: 'atributo', campo }]
// ou null se tiver algo fora do formato
export function lerFormula(texto) {
    const limpo = texto.replace(/\s+/g, '');
    if (!limpo) return null;
    const partes = limpo.match(/[+-]?[^+-]+/g);
    if (!partes || partes.join('') !== limpo) return null;

    const termos = [];
    for (const parte of partes) {
        const sinal = parte.startsWith('-') ? -1 : 1;
        const corpo = semAcento(parte.replace(/^[+-]/, ''));
        const dado = corpo.match(/^(\d*)d(\d+)$/);
        if (dado) {
            const qtd = dado[1] ? Number(dado[1]) : 1;
            const lados = Number(dado[2]);
            if (!LADOS.has(lados) || qtd < 1 || qtd > 50) return null;
            termos.push({ sinal, tipo: 'dado', qtd, lados });
        } else if (/^\d+$/.test(corpo)) {
            termos.push({ sinal, tipo: 'num', valor: Number(corpo) });
        } else if (ATRIBUTOS[corpo]) {
            termos.push({ sinal, tipo: 'atributo', campo: ATRIBUTOS[corpo] });
        } else {
            return null;
        }
    }
    return termos.some(termo => termo.tipo === 'dado') ? termos : null;
}

export function lerCritico(texto) {
    const limpo = semAcento(texto.replace(/\s+/g, '')).replace('×', 'x');
    if (!limpo || limpo === '-') return { tipo: 'nenhum' };
    const multiplicador = limpo.match(/^(?:(\d{1,2})(?:-20)?\/)?x(\d)$/);
    if (multiplicador) return { tipo: 'multiplicar', margem: Number(multiplicador[1] || 20), vezes: Number(multiplicador[2]) };
    const soMargem = limpo.match(/^(\d{1,2})(?:-20)?$/);
    if (soMargem) return { tipo: 'multiplicar', margem: Number(soMargem[1]), vezes: 2 };
    const maximo = limpo.match(/^(?:(\d{1,2})(?:-20)?\/?)?\(?(?:dano)?(?:max|maximo|full)\)?$/);
    if (maximo) return { tipo: 'maximo', margem: Number(maximo[1] || 20) };
    const proprio = limpo.match(/^(?:(\d{1,2})(?:-20)?\/)?(.+)$/);
    const termos = proprio && lerFormula(proprio[2]);
    return termos ? { tipo: 'proprio', margem: Number(proprio[1] || 20), termos } : null;
}

export const ERRO_DANO = 'Dano inválido. Ex.: 1d8+FOR, 2d6+3, d4.';
export const ERRO_CRITICO = 'Crítico inválido. Ex.: 19/x2, x3, 19, 18/max ou 3d8+FOR (vazio ou "-" se não tiver).';

// Termos -> fórmula que a mesa entende ("1d8+3"), com os atributos trocados pelo valor da ficha
export function montarFormula(termos, multiplicarDados = 1) {
    let formula = '';
    for (const termo of termos) {
        let pedaco;
        if (termo.tipo === 'dado') pedaco = `${termo.qtd * multiplicarDados}d${termo.lados}`;
        else if (termo.tipo === 'num') pedaco = String(termo.valor);
        else pedaco = String(valorDoAtributo(termo.campo));
        if (termo.tipo === 'atributo' && pedaco === '0') continue; // atributo zerado: sem "+0" na conta
        const negativo = pedaco.startsWith('-');
        const sinal = (termo.sinal < 0) !== negativo ? '-' : '+';
        formula += sinal + pedaco.replace(/^-/, '');
    }
    return formula.replace(/^\+/, '');
}

// Dano máximo: todos os dados no valor mais alto (vai para a mesa como um número só)
function danoMaximo(termos) {
    const valor = termo => termo.tipo === 'dado' ? termo.qtd * termo.lados
        : termo.tipo === 'num' ? termo.valor
        : valorDoAtributo(termo.campo);
    return String(Math.max(0, termos.reduce((total, termo) => total + termo.sinal * valor(termo), 0)));
}

// item = { nome, dano, critico } (o que a função "ler" devolve)
export function formulaDoCritico(item) {
    if (item.critico.tipo === 'multiplicar') return montarFormula(item.dano, item.critico.vezes);
    if (item.critico.tipo === 'maximo') return danoMaximo(item.dano);
    if (item.critico.tipo === 'proprio') return montarFormula(item.critico.termos);
    return null;
}

// A conta como o jogador lê, com o nome dos atributos ("2d4 + FOR"): vai para o histórico da mesa
export function textoFormula(termos, multiplicarDados = 1) {
    return termos.map((termo, i) => {
        const pedaco = termo.tipo === 'dado' ? `${termo.qtd * multiplicarDados}d${termo.lados}`
            : termo.tipo === 'num' ? String(termo.valor)
            : SIGLAS[termo.campo];
        return i === 0 ? (termo.sinal < 0 ? `-${pedaco}` : pedaco) : `${termo.sinal < 0 ? '−' : '+'} ${pedaco}`;
    }).join(' ');
}

export function textoDoCritico(item) {
    if (item.critico.tipo === 'multiplicar') return textoFormula(item.dano, item.critico.vezes);
    if (item.critico.tipo === 'maximo') return `máximo de ${textoFormula(item.dano)}`;
    return textoFormula(item.critico.termos);
}

// ================= Rolagem =================
// fora da mesa: só para consulta (a rolagem que vale na sessão é a da mesa)
// -> { total, dados: [{ lados, valor, sinal }], modificador }
function rolarAqui(formula) {
    const dados = [];
    let modificador = 0;
    for (const parte of formula.match(/[+-]?[^+-]+/g)) {
        const sinal = parte.startsWith('-') ? -1 : 1;
        const dado = parte.replace(/^[+-]/, '').match(/^(\d+)d(\d+)$/);
        if (dado) {
            const lados = Number(dado[2]);
            for (let i = 0; i < Number(dado[1]); i++) {
                dados.push({ lados, valor: Math.floor(Math.random() * lados) + 1, sinal });
            }
        } else {
            modificador += sinal * Number(parte.replace(/^[+-]/, ''));
        }
    }
    const total = dados.reduce((soma, dado) => soma + dado.sinal * dado.valor, modificador);
    return { total, dados, modificador };
}

function elemento(tag, classe, texto) {
    const el = document.createElement(tag);
    el.className = classe;
    if (texto !== undefined) el.textContent = texto;
    return el;
}

// Resultado como o cartão do histórico da mesa: a conta, cada dado e o total
function mostrarResultado(rotulo, formula, expressao) {
    const { total, dados, modificador } = rolarAqui(formula);
    const conteudo = elemento('div', 'resultadoRolagemLocal');

    conteudo.append(elemento('p', 'contaRolagem', expressao || formula));

    if (dados.length || modificador) {
        const linha = elemento('div', 'dadosRolagem');
        for (const { lados, valor, sinal } of dados) {
            const classes = ['dadoRolagem', valor === lados && 'max', valor === 1 && 'min'].filter(Boolean).join(' ');
            const chip = elemento('span', classes);
            chip.title = `d${lados}`;
            chip.append(elemento('small', '', `${sinal < 0 ? '−' : ''}d${lados}`), String(valor));
            linha.append(chip);
        }
        if (modificador) linha.append(elemento('span', 'modRolagem', modificador > 0 ? `+${modificador}` : `−${-modificador}`));
        conteudo.append(linha);
    }

    conteudo.append(elemento('p', 'resultadoRolagem', String(total)));
    modalInformacao(rotulo, conteudo);
}

function rolar({ formula, rotulo, expressao, personagem, tipo }) {
    if (dentroDaMesa) {
        // tipo: 'creature' (ficha de criatura) ou 'character' (ficha de jogador): muda o ícone no histórico
        const mensagem = { type: 'ficha:rolar', formula, label: rotulo, character: personagem, characterKind: tipo, expression: expressao };
        for (const origem of ORIGENS_DA_MESA) window.parent.postMessage(mensagem, origem);
        return;
    }
    mostrarResultado(rotulo, formula, expressao);
}

// ================= Botões ao lado do campo =================
function dica(botao, texto, ativo) {
    botao.disabled = !ativo;
    botao.dataset.dica = texto;
    botao.setAttribute('aria-label', texto);
}

function criarBotao(icone, classe) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = `botaoRolagem ${classe}`;
    botao.textContent = icone;
    return botao;
}

/**
 * Põe os botões 🎲 Base e 💥 Crítico ao lado do campo (que já precisa estar na página).
 * ler(texto) -> { nome, dano, critico } ou { erro }; personagem() -> nome para o histórico da mesa;
 * tipo: 'character' (ficha de jogador) ou 'creature' (ficha de criatura).
 * Devolve { campo, atualizar(), comErro() }: comErro marca em vermelho se estiver fora do formato.
 */
export function ligarRolagem(campo, { ler, personagem, tipo = 'character', semCritico = 'Sem crítico' }) {
    const linha = document.createElement('div');
    linha.className = 'linhaRolagem';
    campo.before(linha);
    const botaoBase = criarBotao('🎲', 'base');
    const botaoCritico = criarBotao('💥', 'critico');
    linha.append(campo, botaoBase, botaoCritico);

    let item = null;
    function atualizar() {
        const texto = campo.value.trim();
        const lido = texto ? ler(texto) : null;
        item = lido && !lido.erro ? lido : null;

        campo.classList.toggle('rolagemInvalida', Boolean(lido?.erro));
        campo.title = lido?.erro ?? '';
        botaoBase.hidden = botaoCritico.hidden = !texto;
        if (!item) {
            dica(botaoBase, lido?.erro ?? 'Dano base', false);
            dica(botaoCritico, lido?.erro ?? 'Crítico', false);
            return;
        }
        dica(botaoBase, `Dano base: ${montarFormula(item.dano)}`, true);
        const critico = formulaDoCritico(item);
        const margem = item.critico.margem;
        const comoRola = item.critico.tipo === 'maximo' ? `dano máximo, ${critico}` : critico;
        dica(botaoCritico, critico ? `Crítico (${margem < 20 ? `${margem}-20` : '20'}): ${comoRola}` : semCritico, Boolean(critico));
    }

    botaoBase.addEventListener('click', () => {
        if (item) rolar({ formula: montarFormula(item.dano), rotulo: `${item.nome} — Dano`, expressao: textoFormula(item.dano), personagem: personagem(), tipo });
    });
    botaoCritico.addEventListener('click', () => {
        const formula = item && formulaDoCritico(item);
        if (formula) rolar({ formula, rotulo: `${item.nome} — Crítico`, expressao: textoDoCritico(item), personagem: personagem(), tipo });
    });
    campo.addEventListener('input', atualizar);
    // a dica mostra a fórmula já com o valor atual dos atributos
    for (const botao of [botaoBase, botaoCritico]) botao.addEventListener('mouseenter', atualizar);

    atualizar();
    return {
        campo,
        atualizar,
        comErro() {
            atualizar();
            return campo.classList.contains('rolagemInvalida');
        }
    };
}
