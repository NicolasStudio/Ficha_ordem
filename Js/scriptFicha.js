// Ficha: sem ?id na URL cria uma nova, com ?id=... edita a existente
import { db, exigirLogin } from "./scriptFirebase.js";
import { collection, doc, getDoc, addDoc, setDoc, deleteDoc, serverTimestamp }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById('characterForm');
const idFicha = new URLSearchParams(window.location.search).get('id');
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
            alert('Ficha não encontrada.');
            window.location.replace('home.html');
        }
    } catch (error) {
        // As regras do Firestore negam acesso a fichas de outro usuário
        console.error('Erro ao carregar a ficha:', error);
        alert('Ficha não encontrada.');
        window.location.replace('home.html');
    }
}

form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const dados = Object.fromEntries(new FormData(form));
    dados.uid = usuario.uid;
    dados.atualizadoEm = serverTimestamp();

    try {
        if (idFicha) {
            await setDoc(doc(db, 'fichas', idFicha), dados);
        } else {
            await addDoc(collection(db, 'fichas'), dados);
        }
        window.location.replace('home.html');
    } catch (error) {
        console.error('Erro ao salvar a ficha:', error);
        alert('Erro ao salvar a ficha!');
    }
});

document.querySelector('.excluir').addEventListener('click', async function () {
    // Ficha ainda não salva: só volta para a home
    if (!idFicha) {
        window.location.replace('home.html');
        return;
    }

    if (!confirm("Você tem certeza que deseja excluir esta ficha?")) return;

    try {
        await deleteDoc(doc(db, 'fichas', idFicha));
        alert('Ficha excluída com sucesso!');
        window.location.replace('home.html');
    } catch (error) {
        console.error('Erro ao excluir a ficha:', error);
        alert('Ocorreu um erro ao excluir a ficha.');
    }
});
