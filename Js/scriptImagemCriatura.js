// "i" ao lado do Nome da criatura: mostra a imagem da criatura.
// As imagens ficam em Img/criaturas/<elemento principal em minúsculas>, com o nome
// exatamente como está na ficha (maiúsculas, acentos e espaços contam):
//   Elemento principal: Sangue → Img/criaturas/sangue/Zumbi de Sangue.png
// Quando há várias imagens da mesma criatura, elas são numeradas
// ("Zumbi de Sangue 1.png", "Zumbi de Sangue 2.png"...) e o modal ganha [<] e [>].
import { modalInformacao, paragrafo } from "./scriptModal.js";

const PASTA = 'Img/criaturas';
const EXTENSOES = ['png', 'jpg', 'jpeg', 'webp'];
const MAXIMO_VARIANTES = 20;

const campoNome = document.getElementById('nomeCriatura');
const campoElemento = document.getElementById('elementoPrincipal');
const botao = document.getElementById('verImagemCriatura');

function carrega(caminho) {
    return new Promise(resolve => {
        const imagem = new Image();
        imagem.onload = () => resolve(true);
        imagem.onerror = () => resolve(false);
        imagem.src = caminho;
    });
}

// Primeira extensão que existir para esse nome de arquivo (ou null)
async function procurarArquivo(pasta, nomeArquivo) {
    const caminhos = EXTENSOES.map(extensao => `${pasta}/${encodeURIComponent(nomeArquivo)}.${extensao}`);
    const resultados = await Promise.all(caminhos.map(carrega));
    return caminhos[resultados.indexOf(true)] ?? null;
}

// "Nome", "Nome 1", "Nome 2"... A numeração pode começar no 1 ou no 2
// ("Carente.png" + "Carente 2.png"), então só para quando falta um número a partir do 2.
async function procurarImagens(pasta, nome) {
    const encontradas = [];
    const semNumero = await procurarArquivo(pasta, nome);
    if (semNumero) encontradas.push(semNumero);
    for (let numero = 1; numero <= MAXIMO_VARIANTES; numero++) {
        const caminho = await procurarArquivo(pasta, `${nome} ${numero}`);
        if (caminho) encontradas.push(caminho);
        else if (numero >= 2) break;
    }
    return encontradas;
}

function montarCarrossel(imagens, nome) {
    const conteudo = document.createElement('div');
    conteudo.className = 'carrosselCriatura';

    const moldura = document.createElement('div');
    moldura.className = 'molduraImagemCriatura';
    const imagem = document.createElement('img');
    imagem.className = 'imagemCriatura';
    moldura.append(imagem);

    let atual = 0;
    const contador = paragrafo('', 'contadorImagemCriatura');
    function mostrar(indice) {
        atual = (indice + imagens.length) % imagens.length;
        imagem.src = imagens[atual];
        imagem.alt = imagens.length > 1 ? `${nome} (${atual + 1} de ${imagens.length})` : nome;
        contador.textContent = `${atual + 1} / ${imagens.length}`;
    }

    if (imagens.length > 1) {
        const anterior = document.createElement('button');
        anterior.type = 'button';
        anterior.className = 'setaImagemCriatura';
        anterior.textContent = '<';
        anterior.setAttribute('aria-label', 'Imagem anterior');
        anterior.addEventListener('click', () => mostrar(atual - 1));

        const proxima = document.createElement('button');
        proxima.type = 'button';
        proxima.className = 'setaImagemCriatura';
        proxima.textContent = '>';
        proxima.setAttribute('aria-label', 'Próxima imagem');
        proxima.addEventListener('click', () => mostrar(atual + 1));

        // setas do teclado também trocam a imagem enquanto o modal está aberto
        function teclado(event) {
            if (!conteudo.isConnected) return document.removeEventListener('keydown', teclado);
            if (event.key === 'ArrowLeft') mostrar(atual - 1);
            if (event.key === 'ArrowRight') mostrar(atual + 1);
        }
        document.addEventListener('keydown', teclado);

        const linha = document.createElement('div');
        linha.className = 'linhaCarrossel';
        linha.append(anterior, moldura, proxima);
        conteudo.append(linha, contador);
    } else {
        conteudo.append(moldura);
    }

    mostrar(0);
    return conteudo;
}

botao.addEventListener('click', async () => {
    const nome = campoNome.value.trim();
    const elemento = campoElemento.value;

    if (!nome || !elemento) {
        const conteudo = document.createElement('div');
        conteudo.append(paragrafo('Preencha o nome da criatura e o elemento principal para ver a imagem dela.'));
        modalInformacao('Imagem da criatura', conteudo);
        return;
    }

    const pasta = `${PASTA}/${elemento.toLowerCase()}`;
    botao.disabled = true; // evita abrir dois modais enquanto procura
    const imagens = await procurarImagens(pasta, nome);
    botao.disabled = false;

    if (imagens.length) {
        modalInformacao(nome, montarCarrossel(imagens, nome));
    } else {
        const conteudo = document.createElement('div');
        conteudo.append(paragrafo(`Nenhuma imagem encontrada para ${nome}.`));
        conteudo.append(paragrafo(`Para adicionar, salve a imagem em ${pasta} com o nome "${nome}.png" (ou "${nome} 1.png", "${nome} 2.png"... para várias).`));
        modalInformacao(nome, conteudo);
    }
});
