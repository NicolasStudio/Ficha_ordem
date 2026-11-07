// Armas: cada linha segue o cabeçalho da seção, separado por "---":
//   Arma --- Tipo --- Ataque --- Alcance --- Dano --- Crítico --- Recarga --- Especial
// O nome é o que vem antes do primeiro "---". Dano e Crítico têm formato travado (rolagem.js),
// para os botões 🎲 Base e 💥 Crítico rolarem o dano com um clique.
import { lerFormula, lerCritico, ligarRolagem, ERRO_DANO, ERRO_CRITICO } from "./rolagem.js";

const CAMPOS = ['arma1', 'arma2', 'arma3', 'arma4', 'arma5'];

// Uma linha de arma -> { nome, dano, critico } ou { erro }
function lerArma(texto) {
    const partes = texto.split(/\s*---\s*/);
    if (partes.length < 5) return { erro: 'Use o formato do cabeçalho, separado por "---" (até o Dano, pelo menos).' };
    if (partes.length > 8) return { erro: 'São no máximo 8 partes separadas por "---".' };
    const nome = partes[0].trim();
    if (!nome) return { erro: 'Falta o nome da arma (antes do primeiro "---").' };
    const dano = lerFormula(partes[4]);
    if (!dano) return { erro: ERRO_DANO };
    const critico = lerCritico(partes[5] ?? '');
    if (!critico) return { erro: ERRO_CRITICO };
    return { nome, dano, critico };
}

const personagem = () => document.getElementById('nomePersonagem')?.value.trim() ?? '';

const linhas = CAMPOS.map(id => document.getElementById(id))
    .filter(Boolean)
    .map(campo => ligarRolagem(campo, { ler: lerArma, personagem, semCritico: 'Esta arma não tem crítico' }));

document.addEventListener('fichaCarregada', () => linhas.forEach(linha => linha.atualizar()));

/** Armas fora do formato (para não deixar salvar). Também marca cada uma em vermelho. */
export function armasComErro() {
    return linhas.filter(linha => linha.comErro()).map(linha => linha.campo.id);
}
