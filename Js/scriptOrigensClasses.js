// Campos Origem e Classe da ficha: lista com auto-complete e "i" com os detalhes no estilo do livro
import origensInfo from "./origens.js";
import classesInfo from "./classes.js";
import { autoComplete } from "./scriptAutoComplete.js";

function paragrafo(texto, classe) {
    const p = document.createElement('p');
    if (classe) p.className = classe;
    p.textContent = texto;
    return p;
}

// Rótulo em destaque seguido do texto, como no livro: "Perícias Treinadas. Pontaria e Tática."
function linhaComRotulo(rotulo, texto) {
    const p = document.createElement('p');
    const destaque = document.createElement('strong');
    destaque.className = 'rotuloDestaque';
    destaque.textContent = rotulo;
    p.append(destaque, ' ' + texto);
    return p;
}

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

autoComplete({
    campo: document.getElementById('classe'),
    itens: classesInfo,
    tipo: 'classe',
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
