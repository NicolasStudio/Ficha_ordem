// Menu do topo (☰): Menu do mestre (só para o mestre), Tema e Sair.
// Monta o menu dentro do <div class="boxSair"> da página.
import { exigirLogin } from "./scriptFirebase.js";
import { ehMestre } from "./mestres.js";
import { TEMAS, temaAtual, salvarTema, carregarTemaDoUsuario } from "./scriptTema.js";
import { modalInformacao } from "./scriptModal.js";

const usuario = await exigirLogin();
carregarTemaDoUsuario(usuario);

const caixa = document.querySelector('.boxSair');
caixa.innerHTML = `
    <div class="menuTopo">
        <button type="button" class="botaoMenu" aria-label="Abrir menu" aria-expanded="false" aria-controls="menuSuspenso">
            <span></span><span></span><span></span>
        </button>
        <div class="menuSuspenso" id="menuSuspenso" role="menu" hidden></div>
    </div>`;

const botao = caixa.querySelector('.botaoMenu');
const menu = caixa.querySelector('.menuSuspenso');

function item(texto, acao, classe = '') {
    const elemento = document.createElement('button');
    elemento.type = 'button';
    elemento.className = `itemMenu ${classe}`.trim();
    elemento.setAttribute('role', 'menuitem');
    elemento.textContent = texto;
    elemento.addEventListener('click', () => { fechar(); acao(); });
    menu.appendChild(elemento);
}

if (ehMestre(usuario) && !location.pathname.endsWith('mestre.html')) {
    item('Menu do mestre', () => window.location.href = 'mestre.html');
}
item('Tema', abrirTemas);
item('Sair', () => window.sair(), 'itemSair'); // na ficha, sair() pergunta antes se há alterações

function abrir() {
    menu.hidden = false;
    botao.setAttribute('aria-expanded', 'true');
    menu.querySelector('.itemMenu').focus();
}

function fechar() {
    menu.hidden = true;
    botao.setAttribute('aria-expanded', 'false');
}

botao.addEventListener('click', () => menu.hidden ? abrir() : fechar());

// Fecha ao clicar fora ou com Esc
document.addEventListener('click', event => {
    if (!menu.hidden && !caixa.contains(event.target)) fechar();
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) {
        fechar();
        botao.focus();
    }
});

// ================= Escolha de tema =================
// Cada opção mostra uma miniatura com as cores do próprio tema (data-tema no elemento)
function abrirTemas() {
    const lista = document.createElement('div');
    lista.className = 'listaTemas';

    for (const tema of TEMAS) {
        const opcao = document.createElement('button');
        opcao.type = 'button';
        opcao.className = 'opcaoTema';
        opcao.setAttribute('aria-pressed', String(tema.id === temaAtual()));

        const amostra = document.createElement('span');
        amostra.className = 'amostraTema';
        amostra.dataset.tema = tema.id;
        amostra.innerHTML = '<span class="amostraCaixa"><span class="amostraDestaque"></span></span>';

        const texto = document.createElement('span');
        texto.className = 'textoTema';
        texto.innerHTML = '<strong></strong><small></small>';
        texto.querySelector('strong').textContent = tema.nome;
        texto.querySelector('small').textContent = tema.descricao;

        opcao.append(amostra, texto);
        opcao.addEventListener('click', () => {
            salvarTema(tema.id, usuario); // aplica na hora
            for (const outra of lista.children) outra.setAttribute('aria-pressed', String(outra === opcao));
        });
        lista.appendChild(opcao);
    }

    modalInformacao('Tema', lista);
}
