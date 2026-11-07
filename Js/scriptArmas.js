// Armas: cada linha segue o cabeçalho da seção, separado por "---":
//   Arma --- Tipo --- Ataque --- Alcance --- Dano --- Crítico --- Recarga --- Especial
// O nome é o que vem antes do primeiro "---". Dano e Crítico têm formato travado,
// para os botões [Base] e [Crítico] rolarem o dano com um clique:
//   Dano:    dados e números com + e -, e atributos (FOR, AGI, INT, PRE, VIG): "1d8+FOR", "2d8+6"
//   Crítico: margem/multiplicador "19/x2" (multiplica só os dados, como no livro), só "x3",
//            só a margem "19" (x2), dano máximo "18/max" ("dano full"), ou um dano próprio
//            "3d8+FOR" (também "19/3d8+FOR"); vazio ou "-" = sem crítico
// Dentro da mesa (Tabletop) a rolagem vai para a mesa, pública: dados 3D e histórico
// com o nome da arma. Fora dela, rola aqui e mostra o resultado.
import { ORIGENS_DA_MESA, dentroDaMesa } from "./scriptFirebase.js";
import { modalInformacao, paragrafo } from "./scriptModal.js";

const CAMPOS = ['arma1', 'arma2', 'arma3', 'arma4', 'arma5'];
const LADOS = new Set([4, 6, 8, 10, 12, 20, 100]);

// Atributos aceitos nas fórmulas -> campo da ficha (sem acento e sem diferenciar maiúsculas)
const ATRIBUTOS = {
    for: 'forca', forca: 'forca',
    agi: 'agilidade', agilidade: 'agilidade',
    int: 'inteligencia', intelecto: 'inteligencia', inteligencia: 'inteligencia',
    pre: 'presenca', presenca: 'presenca',
    vig: 'vigor', vigor: 'vigor'
};

const semAcento = texto => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// "1d8+FOR-1" -> [{ sinal, tipo: 'dado', qtd, lados } | { tipo: 'num', valor } | { tipo: 'atributo', campo }]
// ou null se tiver algo fora do formato
function lerFormula(texto) {
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

function lerCritico(texto) {
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

// Uma linha de arma -> { nome, dano, critico } ou { erro }
function lerArma(texto) {
    const partes = texto.split(/\s*---\s*/);
    if (partes.length < 5) return { erro: 'Use o formato do cabeçalho, separado por "---" (até o Dano, pelo menos).' };
    if (partes.length > 8) return { erro: 'São no máximo 8 partes separadas por "---".' };
    const nome = partes[0].trim();
    if (!nome) return { erro: 'Falta o nome da arma (antes do primeiro "---").' };
    const dano = lerFormula(partes[4]);
    if (!dano) return { erro: 'Dano inválido. Ex.: 1d8+FOR, 2d6+3, d4.' };
    const critico = lerCritico(partes[5] ?? '');
    if (!critico) return { erro: 'Crítico inválido. Ex.: 19/x2, x3, 19, 18/max ou 3d8+FOR (vazio ou "-" se não tiver).' };
    return { nome, dano, critico };
}

// Termos -> fórmula que a mesa entende ("1d8+3"), com os atributos trocados pelo valor da ficha
function montarFormula(termos, multiplicarDados = 1) {
    let formula = '';
    for (const termo of termos) {
        let pedaco;
        if (termo.tipo === 'dado') pedaco = `${termo.qtd * multiplicarDados}d${termo.lados}`;
        else if (termo.tipo === 'num') pedaco = String(termo.valor);
        else pedaco = String(Number(document.getElementById(termo.campo)?.value) || 0);
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
        : Number(document.getElementById(termo.campo)?.value) || 0;
    return String(Math.max(0, termos.reduce((total, termo) => total + termo.sinal * valor(termo), 0)));
}

function formulaDoCritico(arma) {
    if (arma.critico.tipo === 'multiplicar') return montarFormula(arma.dano, arma.critico.vezes);
    if (arma.critico.tipo === 'maximo') return danoMaximo(arma.dano);
    if (arma.critico.tipo === 'proprio') return montarFormula(arma.critico.termos);
    return null;
}

// ================= Rolagem =================
function rolarAqui(formula) {
    // fora da mesa: só para consulta (a rolagem que vale na sessão é a da mesa)
    const dados = [];
    let total = 0;
    for (const parte of formula.match(/[+-]?[^+-]+/g)) {
        const sinal = parte.startsWith('-') ? -1 : 1;
        const dado = parte.replace(/^[+-]/, '').match(/^(\d+)d(\d+)$/);
        if (dado) {
            for (let i = 0; i < Number(dado[1]); i++) {
                const valor = Math.floor(Math.random() * Number(dado[2])) + 1;
                dados.push(`d${dado[2]}: ${valor}`);
                total += sinal * valor;
            }
        } else {
            total += sinal * Number(parte.replace(/^[+-]/, ''));
        }
    }
    return { total, dados };
}

function rolar(formula, rotulo) {
    if (dentroDaMesa) {
        for (const origem of ORIGENS_DA_MESA) {
            window.parent.postMessage({ type: 'ficha:rolar', formula, label: rotulo }, origem);
        }
        return;
    }
    const { total, dados } = rolarAqui(formula);
    const conteudo = document.createElement('div');
    const resultado = paragrafo(`${total}`);
    resultado.className = 'resultadoRolagem';
    conteudo.append(resultado, paragrafo(`${formula}  →  ${dados.join(' · ')}`));
    modalInformacao(rotulo, conteudo);
}

// ================= Botões e validação =================
const linhas = CAMPOS.map(id => {
    const campo = document.getElementById(id);
    if (!campo) return null;
    const linha = document.createElement('div');
    linha.className = 'linhaArma';
    campo.before(linha);

    const botaoBase = document.createElement('button');
    botaoBase.type = 'button';
    botaoBase.className = 'botaoRolagem';
    botaoBase.textContent = '🎲';
    const botaoCritico = document.createElement('button');
    botaoCritico.type = 'button';
    botaoCritico.className = 'botaoRolagem critico';
    botaoCritico.textContent = '💥';
    linha.append(campo, botaoBase, botaoCritico);

    const estado = { campo, botaoBase, botaoCritico, arma: null };
    botaoBase.addEventListener('click', () => {
        if (estado.arma) rolar(montarFormula(estado.arma.dano), `${estado.arma.nome} — Dano`);
    });
    botaoCritico.addEventListener('click', () => {
        const formula = estado.arma && formulaDoCritico(estado.arma);
        if (formula) rolar(formula, `${estado.arma.nome} — Crítico`);
    });
    campo.addEventListener('input', () => atualizar(estado));
    // a dica mostra a fórmula já com o valor atual dos atributos
    for (const botao of [botaoBase, botaoCritico]) botao.addEventListener('mouseenter', () => atualizar(estado));
    return estado;
}).filter(Boolean);

function dica(botao, texto, ativo) {
    botao.disabled = !ativo;
    botao.dataset.dica = texto;
    botao.setAttribute('aria-label', texto);
}

function atualizar(estado) {
    const { campo, botaoBase, botaoCritico } = estado;
    const texto = campo.value.trim();
    const arma = texto ? lerArma(texto) : null;
    estado.arma = arma && !arma.erro ? arma : null;

    campo.classList.toggle('armaInvalida', Boolean(arma?.erro));
    campo.title = arma?.erro ?? '';
    botaoBase.hidden = botaoCritico.hidden = !texto;
    if (!estado.arma) {
        dica(botaoBase, arma?.erro ?? 'Dano base', false);
        dica(botaoCritico, arma?.erro ?? 'Crítico', false);
        return;
    }
    dica(botaoBase, `Dano base: ${montarFormula(estado.arma.dano)}`, true);
    const critico = formulaDoCritico(estado.arma);
    const margem = estado.arma.critico.margem;
    const comoRola = estado.arma.critico.tipo === 'maximo' ? `dano máximo, ${critico}` : critico;
    dica(botaoCritico, critico ? `Crítico (${margem < 20 ? `${margem}-20` : '20'}): ${comoRola}` : 'Esta arma não tem crítico', Boolean(critico));
}

const atualizarTodas = () => linhas.forEach(atualizar);
atualizarTodas();
document.addEventListener('fichaCarregada', atualizarTodas);

/** Armas fora do formato (para não deixar salvar). Também marca cada uma em vermelho. */
export function armasComErro() {
    atualizarTodas();
    return linhas.filter(estado => estado.campo.classList.contains('armaInvalida')).map(estado => estado.campo.id);
}
