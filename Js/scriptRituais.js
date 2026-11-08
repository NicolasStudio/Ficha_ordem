// Rituais: aba na lateral da ficha (abaixo de Perícias) que abre um painel com um cartão
// por ritual: título, elemento (a imagem muda conforme o elemento), execução, alcance,
// alvo, duração e descrição. Tudo vai para o campo escondido "rituais" (JSON) e é
// salvo junto com a ficha no botão Salvar.
import { somenteLeitura } from "./scriptFicha.js";

const ELEMENTOS = ['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'];
const imagemDoElemento = elemento => `Img/elementos/Elemento ${elemento}.jpg`;
const MAX_RITUAIS = 20;
const MAX_DESCRICAO = 250;

// Campos de texto curtos do cartão, na ordem em que aparecem ao lado da imagem
const CAMPOS = [
    { chave: 'execucao', rotulo: 'Execução', exemplo: 'padrão' },
    { chave: 'alcance', rotulo: 'Alcance', exemplo: 'toque' },
    { chave: 'alvo', rotulo: 'Alvo', exemplo: '1 criatura' },
    { chave: 'duracao', rotulo: 'Duração', exemplo: 'instantânea' }
];

const aba = document.querySelector('.abaRituais');
const painel = document.getElementById('painelRituais');
const lista = painel.querySelector('.listaRituais');
const botaoNovo = painel.querySelector('.novoRitual');
const campoSalvo = document.getElementById('rituais');

// ================= Abrir e fechar (como o painel de Perícias) =================
const fundo = document.createElement('div');
fundo.className = 'fundoPericias'; // mesmo fundo escuro do painel de Perícias
document.body.appendChild(fundo);

function abrir() {
    painel.hidden = false;
    aba.hidden = true;
    aba.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => {
        painel.classList.add('aberto');
        fundo.classList.add('aberto');
    });
}

function fechar() {
    painel.classList.remove('aberto');
    fundo.classList.remove('aberto');
    aba.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
        painel.hidden = true;
        aba.hidden = false;
    }, 400); // espera a animação de saída
}

aba.addEventListener('click', abrir);
fundo.addEventListener('click', () => {
    if (painel.classList.contains('aberto')) fechar();
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && painel.classList.contains('aberto')) fechar();
});

// ================= Cartões =================
function lerSalvos() {
    try {
        const rituais = JSON.parse(campoSalvo.value || '[]');
        return Array.isArray(rituais) ? rituais : [];
    } catch {
        return [];
    }
}

// O campo salvo recebe todos os cartões (os totalmente vazios ficam de fora)
function guardar() {
    const rituais = [...lista.children].map(cartao => {
        const ritual = { titulo: cartao.querySelector('.tituloRitual').value.trim() };
        ritual.elemento = cartao.querySelector('.elementoRitual').value;
        for (const { chave } of CAMPOS) ritual[chave] = cartao.querySelector(`[data-campo="${chave}"]`).value.trim();
        ritual.descricao = cartao.querySelector('.descricaoRitual').value.trim();
        return ritual;
    }).filter(ritual => Object.values(ritual).some(Boolean));
    campoSalvo.value = rituais.length ? JSON.stringify(rituais) : '';
}

function criarCampo(tag, classe, atributos = {}) {
    const campo = document.createElement(tag);
    campo.className = classe;
    Object.assign(campo, atributos);
    return campo;
}

function mostrarImagem(cartao, elemento) {
    const imagem = cartao.querySelector('.imagemRitual');
    imagem.classList.toggle('semElemento', !elemento);
    imagem.style.backgroundImage = elemento ? `url("${imagemDoElemento(elemento)}")` : '';
    imagem.setAttribute('aria-label', elemento ? `Elemento ${elemento}` : 'Escolha o elemento');
}

function criarCartao(ritual = {}) {
    const cartao = document.createElement('article');
    cartao.className = 'cartaoRitual';

    // Título + remover
    const topo = criarCampo('div', 'topoRitual');
    const titulo = criarCampo('input', 'tituloRitual', {
        type: 'text', maxLength: 60, placeholder: 'Título do ritual', value: ritual.titulo ?? ''
    });
    titulo.setAttribute('aria-label', 'Título do ritual');
    const remover = criarCampo('button', 'removerRitual', { type: 'button', textContent: '✕', title: 'Remover ritual' });
    remover.setAttribute('aria-label', 'Remover ritual');
    remover.addEventListener('click', () => {
        cartao.remove();
        guardar();
        atualizarBotaoNovo();
        lista.dispatchEvent(new Event('input', { bubbles: true })); // marca a ficha como alterada
    });
    topo.append(titulo, remover);

    // Elemento
    const elemento = criarCampo('select', 'elementoRitual');
    elemento.setAttribute('aria-label', 'Elemento do ritual');
    elemento.append(new Option('Elemento…', ''), ...ELEMENTOS.map(nome => new Option(nome, nome)));
    elemento.value = ELEMENTOS.includes(ritual.elemento) ? ritual.elemento : '';
    elemento.addEventListener('change', () => {
        mostrarImagem(cartao, elemento.value);
        guardar();
    });

    // Execução, alcance, alvo e duração à esquerda; imagem do elemento à direita
    const corpo = criarCampo('div', 'corpoRitual');
    const campos = criarCampo('div', 'camposRitual');
    for (const { chave, rotulo, exemplo } of CAMPOS) {
        const linha = criarCampo('label', 'linhaRitual');
        const nome = criarCampo('span', 'rotuloRitual', { textContent: `${rotulo}:` });
        const campo = criarCampo('input', 'campoRitual', {
            type: 'text', maxLength: 40, placeholder: exemplo, value: ritual[chave] ?? ''
        });
        campo.dataset.campo = chave;
        linha.append(nome, campo);
        campos.append(linha);
    }
    const imagem = criarCampo('div', 'imagemRitual');
    imagem.setAttribute('role', 'img');
    corpo.append(campos, imagem);

    // Descrição com contador
    const descricao = criarCampo('textarea', 'descricaoRitual', {
        maxLength: MAX_DESCRICAO, placeholder: 'Descrição do ritual...', value: ritual.descricao ?? ''
    });
    descricao.setAttribute('aria-label', 'Descrição do ritual');
    const contador = criarCampo('small', 'contadorRitual');
    const contar = () => contador.textContent = `${descricao.value.length}/${MAX_DESCRICAO}`;
    descricao.addEventListener('input', contar);
    contar();

    cartao.append(topo, elemento, corpo, descricao, contador);
    cartao.addEventListener('input', guardar);
    mostrarImagem(cartao, elemento.value);
    return cartao;
}

function atualizarBotaoNovo() {
    const cheio = lista.children.length >= MAX_RITUAIS;
    botaoNovo.disabled = cheio;
    botaoNovo.textContent = cheio ? `Limite de ${MAX_RITUAIS} rituais` : '+ Novo ritual';
}

botaoNovo.addEventListener('click', () => {
    if (lista.children.length >= MAX_RITUAIS) return;
    const cartao = criarCartao();
    lista.append(cartao);
    atualizarBotaoNovo();
    cartao.querySelector('.tituloRitual').focus();
});

// Ficha de outro jogador (o mestre consultando): só leitura
function aplicarSomenteLeitura() {
    if (!somenteLeitura) return;
    botaoNovo.hidden = true;
    for (const campo of lista.querySelectorAll('input, textarea')) campo.readOnly = true;
    for (const campo of lista.querySelectorAll('select, .removerRitual')) campo.disabled = true;
    for (const botao of lista.querySelectorAll('.removerRitual')) botao.hidden = true;
}

// Monta os cartões a partir do que foi salvo (ao abrir e ao limpar a ficha)
function montar() {
    lista.replaceChildren(...lerSalvos().slice(0, MAX_RITUAIS).map(criarCartao));
    if (!lista.children.length && !somenteLeitura) lista.append(criarCartao());
    atualizarBotaoNovo();
    aplicarSomenteLeitura();
}

// Este script espera o scriptFicha.js terminar (import acima): a ficha já foi carregada
montar();
document.addEventListener('fichaCarregada', montar); // "Limpar" também avisa
