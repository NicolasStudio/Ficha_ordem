// Campos Origem e Classe da ficha: lista com auto-complete e "i" com os detalhes no estilo do livro
import origensInfo from "./origens.js";
import classesInfo from "./classes.js";
import { autoComplete } from "./scriptAutoComplete.js";
import { avisar, paragrafo, linhaComRotulo } from "./scriptModal.js";

// ================= Origem =================
autoComplete({
    campo: document.getElementById('origem'),
    itens: origensInfo,
    tipo: 'origem',
    detalhes: origem => {
        const conteudo = document.createElement('div');

        // O texto da habilidade começa pelo nome dela; o nome vai em destaque e o resto em seguida
        const textoHabilidade = origem.habilities.startsWith(origem.habilitiesName)
            ? origem.habilities.slice(origem.habilitiesName.length).trim()
            : origem.habilities;

        conteudo.append(
            paragrafo(origem.description),
            linhaComRotulo('Perícias Treinadas.', origem.trainedName + '.'),
            linhaComRotulo(origem.habilitiesName, textoHabilidade)
        );
        return conteudo;
    }
});

// ================= Classe =================
// Pontos iniciais com a progressão por NEX logo abaixo, em texto menor
function linhaDePontos(rotulo, valor, detalhe) {
    const p = linhaComRotulo(rotulo, valor + '.');
    const sub = document.createElement('span');
    sub.className = 'detalhePontos';
    sub.textContent = detalhe + '.';
    p.appendChild(sub);
    return p;
}

// Valores iniciais da classe como base para o jogador. Um campo só recebe valor automático se:
//  - estiver vazio, ou
//  - ainda tiver o valor automático que a ficha colocou e o jogador não mexeu.
// O que o jogador digitou ou editou não é sobrescrito; a única exceção é a regra fixa
// do PV/PE máximo acompanhar VIG/PRE (mais abaixo), que preserva o ajuste dele.
const atributos = { FOR: 'forca', AGI: 'agilidade', INT: 'inteligencia', PRE: 'presenca', VIG: 'vigor' };
const camposPontos = ['pv_atual', 'pv_total', 'pe_atual', 'pe_total', 'san_atual', 'san_total'];
const campoPorNome = nome => document.querySelector(`[name="${nome}"]`);

// O jogador digitou no campo: o valor passa a ser dele (sai a marca de automático)
for (const nome of camposPontos) {
    campoPorNome(nome).addEventListener('input', event => {
        if (event.isTrusted) delete event.target.dataset.automatico;
    });
}

// Ainda tem o valor que a ficha colocou, sem edição do jogador
const ehAutomatico = campo => campo.dataset.automatico !== undefined && campo.dataset.automatico === campo.value;

// "20 + VIG" -> 20 + valor do Vigor na ficha (vazio conta como 0); "12" -> 12
function calcularPontos(formula) {
    const [, base, sigla] = formula.match(/^(\d+)\s*(?:\+\s*([A-Z]{3}))?$/) || [];
    if (base === undefined) return null;
    const valorAtributo = sigla ? parseInt(document.querySelector(`[name="${atributos[sigla]}"]`).value, 10) || 0 : 0;
    return parseInt(base, 10) + valorAtributo;
}

// Retorna true se algum campo mudou.
// apenasAutomaticos: true ao mudar atributos (não preenche campos vazios, só atualiza os automáticos)
function preencherPontosIniciais(classe, apenasAutomaticos = false) {
    const pontos = [
        [classe.life, 'pv_atual', 'pv_total'],
        [classe.effort, 'pe_atual', 'pe_total'],
        [classe.sanity, 'san_atual', 'san_total']
    ];
    let mudou = false;

    for (const [formula, ...nomesCampos] of pontos) {
        const valor = calcularPontos(formula);
        if (valor === null) continue;
        for (const nome of nomesCampos) {
            const campo = campoPorNome(nome);
            const vazio = campo.value.trim() === '';
            const podeMudar = ehAutomatico(campo) || (vazio && !apenasAutomaticos);
            if (!podeMudar || campo.value === String(valor)) continue;

            campo.value = valor;
            campo.dataset.automatico = String(valor);
            campo.dispatchEvent(new Event('input', { bubbles: true })); // conta como alteração não salva
            mudou = true;
        }
    }
    return mudou;
}

function escolheuClasse(classe) {
    if (preencherPontosIniciais(classe)) {
        avisar(`Vida, Esforço e Sanidade iniciais do ${classe.name} preenchidos.`);
    }
}

function classeDoCampo() {
    const normalizar = texto => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const texto = normalizar(document.getElementById('classe').value);
    return classesInfo.find(classe => normalizar(classe.name) === texto);
}

// ================= Regra fixa do sistema =================
// PV máximo = classe + VIG e PE máximo = classe + PRE (Sanidade não usa atributo).
// Quando VIG ou PRE muda, o máximo sobe ou desce a mesma diferença, SEMPRE,
// mantendo qualquer ajuste que o jogador tenha feito (pontos a mais ou a menos).
const maximoDoAtributo = { vigor: 'pv_total', presenca: 'pe_total' };
const valorAtributo = nome => parseInt(campoPorNome(nome).value, 10) || 0; // vazio conta como 0
const atributoAnterior = {};

// Ponto de partida para calcular a diferença (inclusive ao abrir uma ficha salva)
function guardarAtributos() {
    for (const nome of Object.keys(maximoDoAtributo)) atributoAnterior[nome] = valorAtributo(nome);
}
guardarAtributos();
document.addEventListener('fichaCarregada', guardarAtributos);

for (const nome of new Set(Object.values(atributos))) {
    campoPorNome(nome).addEventListener('input', () => {
        const nomeMaximo = maximoDoAtributo[nome];
        if (nomeMaximo) {
            const diferenca = valorAtributo(nome) - atributoAnterior[nome];
            atributoAnterior[nome] = valorAtributo(nome);

            const maximo = campoPorNome(nomeMaximo);
            const atual = parseInt(maximo.value, 10);
            if (diferenca !== 0 && !isNaN(atual)) {
                const eraAutomatico = ehAutomatico(maximo);
                maximo.value = atual + diferenca;
                if (eraAutomatico) maximo.dataset.automatico = maximo.value; // continua automático
                maximo.dispatchEvent(new Event('input', { bubbles: true })); // conta como alteração não salva
            }
        }

        // Valores automáticos ainda intocados (ex.: PV atual) acompanham a classe e os atributos
        const classe = classeDoCampo();
        if (classe) preencherPontosIniciais(classe, true);
    });
}

autoComplete({
    campo: document.getElementById('classe'),
    itens: classesInfo,
    tipo: 'classe',
    aoEscolher: escolheuClasse,
    detalhes: classe => {
        const conteudo = document.createElement('div');
        conteudo.append(
            paragrafo(classe.briefing, 'resumoClasse'),
            ...classe.description.split('\n\n').map(texto => paragrafo(texto)),
            linhaDePontos('Pontos de Vida Iniciais.', classe.life, classe.lifeDetails),
            linhaDePontos('Pontos de Esforço Iniciais.', classe.effort, classe.effortDetails),
            linhaDePontos('Sanidade Inicial.', classe.sanity, classe.sanityDetails),
            linhaComRotulo('Perícias Treinadas.', classe.trainedName)
        );
        return conteudo;
    }
});
