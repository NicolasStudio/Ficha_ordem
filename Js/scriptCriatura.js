// Ficha de criatura (só o mestre): sem ?id na URL cria uma nova, com ?id=... edita a existente
import { db } from "./scriptFirebase.js";
import { exigirMestre } from "./mestres.js";
import { confirmarModal, avisar, avisarNaProximaPagina } from "./scriptModal.js";
import { collection, doc, getDoc, addDoc, setDoc, deleteDoc, serverTimestamp }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById('formCriatura');
const idCriatura = new URLSearchParams(window.location.search).get('id');
const LISTA = 'criaturas.html';

const mestre = await exigirMestre();
document.body.style.visibility = '';

// ================= Alterações não salvas =================
let alterado = false;
form.addEventListener('input', () => alterado = true);
form.addEventListener('change', () => alterado = true); // listas de elemento

async function podeSair() {
    if (!alterado) return true;
    if (!await confirmarModal('Deseja realmente sair?', 'Os dados serão perdidos.')) return false;
    alterado = false;
    return true;
}

// Sair (menu ☰) também pergunta antes
const sairOriginal = window.sair;
window.sair = async () => { if (await podeSair()) sairOriginal(); };

window.addEventListener('beforeunload', event => {
    if (alterado) event.preventDefault();
});

form.querySelector('.btnVoltar').addEventListener('click', async () => {
    if (await podeSair()) window.location.href = LISTA;
});

// ================= Carregar =================
const campos = () => [...form.elements].filter(campo => campo.name);

if (idCriatura) {
    try {
        const snap = await getDoc(doc(db, 'criaturas', idCriatura));
        if (!snap.exists() || snap.data().uid !== mestre.uid) throw new Error('Criatura não encontrada');
        const criatura = snap.data();
        for (const campo of campos()) {
            if (criatura[campo.name] !== undefined) campo.value = criatura[campo.name];
        }
    } catch (error) {
        console.error('Erro ao carregar a criatura:', error);
        avisarNaProximaPagina('Criatura não encontrada.', 'erro');
        window.location.replace(LISTA);
    }
}

// ================= Salvar =================
form.addEventListener('submit', async event => {
    event.preventDefault();

    // Trava o botão para um clique duplo não criar a mesma criatura duas vezes
    const botao = form.querySelector('.btnSalvar');
    if (botao.disabled) return;
    botao.disabled = true;

    const dados = Object.fromEntries(new FormData(form));
    dados.uid = mestre.uid;
    dados.atualizadoEm = serverTimestamp();

    try {
        if (idCriatura) {
            await setDoc(doc(db, 'criaturas', idCriatura), dados);
        } else {
            await addDoc(collection(db, 'criaturas'), dados);
        }
        alterado = false;
        avisarNaProximaPagina('Criatura salva com sucesso!');
        window.location.replace(LISTA);
    } catch (error) {
        console.error('Erro ao salvar a criatura:', error);
        avisar('Erro ao salvar a criatura.', 'erro');
        botao.disabled = false;
    }
});

// ================= Excluir =================
form.querySelector('.excluir').addEventListener('click', async () => {
    // Criatura ainda não salva: só volta para a lista
    if (!idCriatura) {
        if (await podeSair()) window.location.replace(LISTA);
        return;
    }

    if (!await confirmarModal('Deseja realmente excluir esta criatura?', 'Essa ação não pode ser desfeita.')) return;

    try {
        await deleteDoc(doc(db, 'criaturas', idCriatura));
        alterado = false;
        avisarNaProximaPagina('Criatura excluída com sucesso!');
        window.location.replace(LISTA);
    } catch (error) {
        console.error('Erro ao excluir a criatura:', error);
        avisar('Ocorreu um erro ao excluir a criatura.', 'erro');
    }
});

// ================= Limpar =================
form.querySelector('.btnLimpar').addEventListener('click', async () => {
    if (!campos().some(campo => campo.value.trim() !== '')) {
        avisar('A ficha já está vazia.');
        return;
    }

    const texto = idCriatura
        ? 'Todos os campos serão apagados. A criatura salva só muda quando você clicar em Salvar.'
        : 'Todos os campos preenchidos serão apagados.';
    if (!await confirmarModal('Deseja realmente limpar a ficha?', texto)) return;

    for (const campo of campos()) campo.value = '';
    alterado = true; // sair sem salvar ainda pergunta
    window.scrollTo({ top: 0, behavior: 'smooth' });
    avisar('Ficha limpa.');
});
