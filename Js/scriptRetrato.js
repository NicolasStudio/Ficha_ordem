// "i" ao lado do Nome do Personagem: mostra a imagem do personagem.
// As imagens ficam em Img/players, com o nome do personagem exatamente como está
// na ficha (maiúsculas, acentos e espaços contam): "Yohan Rosen Bauldis.png".
import { modalInformacao, paragrafo } from "./scriptModal.js";

const PASTA = 'Img/players';
const EXTENSOES = ['png', 'jpg', 'jpeg', 'webp'];

const campoNome = document.getElementById('nomePersonagem');
const botao = document.getElementById('verRetrato');

// Tenta cada extensão; resolve com a primeira imagem que carregar (ou null)
async function procurarImagem(nome) {
    for (const extensao of EXTENSOES) {
        const caminho = `${PASTA}/${encodeURIComponent(nome)}.${extensao}`;
        const carregou = await new Promise(resolve => {
            const imagem = new Image();
            imagem.onload = () => resolve(true);
            imagem.onerror = () => resolve(false);
            imagem.src = caminho;
        });
        if (carregou) return caminho;
    }
    return null;
}

botao.addEventListener('click', async () => {
    const nome = campoNome.value.trim();
    const conteudo = document.createElement('div');

    if (!nome) {
        conteudo.append(paragrafo('Preencha o nome do personagem para ver a imagem dele.'));
        modalInformacao('Imagem do personagem', conteudo);
        return;
    }

    botao.disabled = true; // evita abrir dois modais enquanto procura
    const caminho = await procurarImagem(nome);
    botao.disabled = false;

    if (caminho) {
        const imagem = document.createElement('img');
        imagem.className = 'retratoPersonagem';
        imagem.src = caminho;
        imagem.alt = nome;
        conteudo.append(imagem);
    } else {
        conteudo.append(paragrafo(`Nenhuma imagem encontrada para ${nome}.`));
        conteudo.append(paragrafo(`Para adicionar, salve a imagem em ${PASTA} com o nome "${nome}.png".`));
    }
    modalInformacao(nome, conteudo);
});
