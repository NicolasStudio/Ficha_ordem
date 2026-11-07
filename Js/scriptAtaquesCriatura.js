// Ataques da criatura (só o mestre): uma linha por ataque, com os botões 🎲 Base e 💥 Crítico.
//   Nome --- Dano --- Crítico --- Especial     ex.: "Sugar vitalidade --- 2d4 --- x2 --- 4 PE"
// Crítico e Especial são opcionais. O que é salvo continua sendo o texto do campo "ataques"
// (uma linha por ataque); na tela, cada linha vira um campo com botões (rolagem.js).
import { lerFormula, lerCritico, ligarRolagem, ERRO_DANO, ERRO_CRITICO } from "./rolagem.js";

const MIN_LINHAS = 3;
const MAX_LINHAS = 15; // 15 linhas de até 120 caracteres cabem nos 2000 do campo salvo

const textoSalvo = document.getElementById('ataques');
const lista = document.createElement('div');
lista.className = 'listaAtaques';
textoSalvo.after(lista);
textoSalvo.hidden = true; // continua no formulário: é ele que vai para o banco

// Uma linha de ataque -> { nome, dano, critico } ou { erro }
function lerAtaque(texto) {
    const partes = texto.split(/\s*---\s*/);
    if (partes.length < 2) return { erro: 'Use: Nome --- Dano --- Crítico (ex.: Garra --- 1d6+FOR --- x2).' };
    if (partes.length > 4) return { erro: 'São no máximo 4 partes: Nome --- Dano --- Crítico --- Especial.' };
    const nome = partes[0].trim();
    if (!nome) return { erro: 'Falta o nome do ataque (antes do primeiro "---").' };
    const dano = lerFormula(partes[1]);
    if (!dano) return { erro: ERRO_DANO };
    const critico = lerCritico(partes[2] ?? '');
    if (!critico) return { erro: ERRO_CRITICO };
    return { nome, dano, critico };
}

const criatura = () => document.getElementById('nomeCriatura')?.value.trim() ?? '';

let linhas = [];

// O campo salvo recebe as linhas preenchidas, na ordem
function guardar() {
    textoSalvo.value = linhas.map(linha => linha.campo.value.trim()).filter(Boolean).join('\n');
}

function criarLinha(valor = '') {
    const numero = linhas.length + 1;
    const campo = document.createElement('input');
    campo.type = 'text';
    campo.className = 'campoCriatura campoAtaque';
    campo.maxLength = 120;
    campo.value = valor;
    campo.placeholder = numero === 1 ? 'Ex.: Garra --- 1d6+FOR --- x2 --- 2 PE' : `Ataque ${numero}`;
    campo.setAttribute('aria-label', `Ataque ${numero}`);
    lista.append(campo);
    linhas.push(ligarRolagem(campo, { ler: lerAtaque, personagem: criatura, semCritico: 'Este ataque não tem crítico' }));
    campo.addEventListener('input', () => {
        guardar();
        sempreUmaLinhaVazia();
    });
}

// Ao preencher a última linha, aparece mais uma (até o limite)
function sempreUmaLinhaVazia() {
    if (linhas.length < MAX_LINHAS && linhas.at(-1).campo.value.trim()) criarLinha();
}

// Monta as linhas a partir do texto salvo (ao abrir, carregar e limpar a ficha)
function montar() {
    lista.replaceChildren();
    linhas = [];
    const salvas = textoSalvo.value.split('\n').map(linha => linha.trim()).filter(Boolean);
    for (const valor of salvas.slice(0, MAX_LINHAS)) criarLinha(valor);
    while (linhas.length < MIN_LINHAS) criarLinha();
    sempreUmaLinhaVazia();
}

montar();
document.addEventListener('fichaCarregada', montar);

/** Ataques fora do formato (para não deixar salvar). Também marca cada um em vermelho. */
export function ataquesComErro() {
    return linhas.filter(linha => linha.comErro()).map(linha => linha.campo);
}
