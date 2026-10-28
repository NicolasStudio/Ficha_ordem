// Temas de cores (as cores ficam em CSS/styleTema.css).
// O tema escolhido fica salvo no navegador (aplica na hora, sem piscar) e no cadastro
// do jogador no Firebase (vale em qualquer aparelho).
import { db } from "./scriptFirebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const TEMAS = [
    { id: 'classico', nome: 'Clássico', descricao: 'Azul e ciano: o visual original.' },
    { id: 'sangue', nome: 'Sangue', descricao: 'Vermelho-sangue, preto e branco.' },
    { id: 'morte', nome: 'Morte', descricao: 'Preto e branco.' },
    { id: 'conhecimento', nome: 'Conhecimento', descricao: 'Claro: branco e dourado.' },
    { id: 'energia', nome: 'Energia', descricao: 'Escuro, puxado para o roxo.' }
];

const existe = id => TEMAS.some(tema => tema.id === id);

export const temaAtual = () => document.documentElement.dataset.tema || 'classico';

export function aplicarTema(id) {
    if (!existe(id)) return;
    document.documentElement.dataset.tema = id;
    try { localStorage.setItem('tema', id); } catch { /* sem localStorage: vale só nesta página */ }
}

// Aplica na hora e guarda no cadastro do jogador
export async function salvarTema(id, usuario) {
    aplicarTema(id);
    try {
        await setDoc(doc(db, 'usuarios', usuario.uid), { tema: id }, { merge: true });
    } catch (error) {
        console.error('Erro ao salvar o tema:', error);
    }
}

// Usa o tema do cadastro (ex.: escolhido em outro aparelho), se for diferente do atual
export async function carregarTemaDoUsuario(usuario) {
    try {
        const cadastro = await getDoc(doc(db, 'usuarios', usuario.uid));
        const tema = cadastro.exists() ? cadastro.data().tema : null;
        if (tema && tema !== temaAtual()) aplicarTema(tema);
    } catch (error) {
        console.error('Erro ao carregar o tema:', error);
    }
}
