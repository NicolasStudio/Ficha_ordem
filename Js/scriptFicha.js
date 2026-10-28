// Ficha: sem ?id na URL cria uma nova, com ?id=... edita a existente
import { db, exigirLogin } from "./scriptFirebase.js";
import { confirmarModal, avisar, avisarNaProximaPagina } from "./scriptModal.js";
import { collection, doc, getDoc, addDoc, setDoc, deleteDoc, serverTimestamp }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById('characterForm');
const idFicha = new URLSearchParams(window.location.search).get('id');

// ================= Alterações não salvas =================
// Qualquer coisa digitada marca a ficha como alterada até ser salva
let alterado = false;
form.addEventListener('input', () => alterado = true);

async function podeSair() {
    if (!alterado) return true;
    if (!await confirmarModal('Deseja realmente sair?', 'Os dados serão perdidos.')) return false;
    alterado = false; // já confirmou, o aviso do navegador não precisa aparecer de novo
    return true;
}

// Os botões "Sair" e "Voltar" chamam sair() e voltar(): perguntam antes de sair
const sairOriginal = window.sair;
const voltarOriginal = window.voltar;
window.sair = async () => { if (await podeSair()) sairOriginal(); };
window.voltar = async () => { if (await podeSair()) voltarOriginal(); };

// Fechar a aba, recarregar ou usar o "voltar" do navegador: aviso padrão do navegador
window.addEventListener('beforeunload', event => {
    if (alterado) event.preventDefault();
});

const usuario = await exigirLogin();

// Preenche os campos do formulário com os dados salvos
function preencherFicha(ficha) {
    for (const campo of form.elements) {
        if (campo.name && ficha[campo.name] !== undefined) {
            campo.value = ficha[campo.name];
        }
    }
    calcularEspacoTotal();
    calcularPesoTotal();
}

if (idFicha) {
    try {
        const snap = await getDoc(doc(db, 'fichas', idFicha));
        if (snap.exists()) {
            preencherFicha(snap.data());
        } else {
            avisarNaProximaPagina('Ficha não encontrada.', 'erro');
            window.location.replace('home.html');
        }
    } catch (error) {
        // As regras do Firestore negam acesso a fichas de outro usuário
        console.error('Erro ao carregar a ficha:', error);
        avisarNaProximaPagina('Ficha não encontrada.', 'erro');
        window.location.replace('home.html');
    }
}

form.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Trava o botão para um clique duplo não criar a mesma ficha duas vezes
    const botao = form.querySelector('button[type="submit"]');
    if (botao.disabled) return;
    botao.disabled = true;

    const dados = Object.fromEntries(new FormData(form));
    dados.uid = usuario.uid;
    dados.atualizadoEm = serverTimestamp();

    try {
        if (idFicha) {
            await setDoc(doc(db, 'fichas', idFicha), dados);
        } else {
            await addDoc(collection(db, 'fichas'), dados);
        }
        alterado = false;
        avisarNaProximaPagina('Ficha salva com sucesso!');
        window.location.replace('home.html');
    } catch (error) {
        console.error('Erro ao salvar a ficha:', error);
        avisar('Erro ao salvar a ficha.', 'erro');
        botao.disabled = false;
    }
});

document.querySelector('.excluir').addEventListener('click', async function () {
    // Ficha ainda não salva: só volta para a home
    if (!idFicha) {
        if (await podeSair()) window.location.replace('home.html');
        return;
    }

    if (!await confirmarModal('Deseja realmente excluir esta ficha?', 'Essa ação não pode ser desfeita.')) return;

    try {
        await deleteDoc(doc(db, 'fichas', idFicha));
        alterado = false; // a ficha foi apagada, não há o que salvar
        avisarNaProximaPagina('Ficha excluída com sucesso!');
        window.location.replace('home.html');
    } catch (error) {
        console.error('Erro ao excluir a ficha:', error);
        avisar('Ocorreu um erro ao excluir a ficha.', 'erro');
    }
});
