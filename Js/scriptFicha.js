// Ficha: sem ?id na URL cria uma nova, com ?id=... edita a existente
import { db, exigirLogin } from "./scriptFirebase.js";
import { confirmarModal, avisar, avisarNaProximaPagina } from "./scriptModal.js";
import { collection, doc, getDoc, addDoc, setDoc, deleteDoc, writeBatch, serverTimestamp }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById('characterForm');
export const idFicha = new URLSearchParams(window.location.search).get('id');

// ================= Alterações não salvas =================
// Qualquer coisa digitada marca a ficha como alterada até ser salva
let alterado = false;
form.addEventListener('input', () => alterado = true);
export const temAlteracoes = () => alterado;

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

export const usuario = await exigirLogin();

// Preenche os campos do formulário com os dados salvos
function preencherFicha(ficha) {
    for (const campo of form.elements) {
        if (campo.name && ficha[campo.name] !== undefined) {
            campo.value = ficha[campo.name];
        }
    }
    calcularEspacoTotal();
    calcularPesoTotal();
    // Avisa quem depende dos valores carregados (ex.: o "i" do campo Origem)
    document.dispatchEvent(new Event('fichaCarregada'));
}

// ================= Somente leitura =================
// O mestre pode abrir a ficha de outro jogador, mas não alterar (as regras do Firestore também impedem)
export let somenteLeitura = false;

async function ativarSomenteLeitura(uidDono) {
    somenteLeitura = true;

    for (const campo of form.elements) {
        if (campo.tagName === 'INPUT' || campo.tagName === 'TEXTAREA') campo.readOnly = true;
    }
    for (const botao of form.querySelectorAll('.btnSalvar, .btnLimpar, .excluir')) botao.hidden = true;
    window.voltar = () => window.location.href = 'jogadores.html';

    let nomeJogador = 'outro jogador';
    try {
        const cadastro = await getDoc(doc(db, 'usuarios', uidDono));
        if (cadastro.exists()) nomeJogador = cadastro.data().nome || cadastro.data().email || nomeJogador;
    } catch (error) {
        console.error('Erro ao buscar o jogador:', error);
    }

    const aviso = document.createElement('div');
    aviso.className = 'avisoLeitura';
    aviso.textContent = `Ficha de ${nomeJogador} — somente leitura`;
    document.body.prepend(aviso);
}

if (idFicha) {
    try {
        const snap = await getDoc(doc(db, 'fichas', idFicha));
        if (snap.exists()) {
            preencherFicha(snap.data());
            if (snap.data().uid !== usuario.uid) await ativarSomenteLeitura(snap.data().uid);
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

// Dados de todos os campos da ficha, prontos para gravar
function dadosDaFicha() {
    const dados = Object.fromEntries(new FormData(form));
    dados.uid = usuario.uid;
    dados.atualizadoEm = serverTimestamp();
    return dados;
}

// Grava a ficha aberta sem sair dela (usado ao receber algo do mestre: scriptRecebimentos.js).
// apagarJunto: documento apagado na mesma operação (o envio já recebido), para o item não entrar duas vezes
export async function salvarFichaAberta(apagarJunto) {
    const lote = writeBatch(db);
    lote.set(doc(db, 'fichas', idFicha), dadosDaFicha());
    if (apagarJunto) lote.delete(apagarJunto);
    await lote.commit();
    alterado = false;
}

form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (somenteLeitura) return; // ex.: Enter num campo da ficha de outro jogador

    // Trava o botão para um clique duplo não criar a mesma ficha duas vezes
    const botao = form.querySelector('button[type="submit"]');
    if (botao.disabled) return;
    botao.disabled = true;

    const dados = dadosDaFicha();

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

// Limpar: apaga todos os campos da tela. Numa ficha salva, só vale depois de Salvar.
document.querySelector('.btnLimpar').addEventListener('click', async function () {
    const campos = [...form.elements].filter(campo => campo.name && campo.type !== 'submit' && campo.type !== 'button');

    if (!campos.some(campo => !campo.disabled && campo.value.trim() !== '')) {
        avisar('A ficha já está vazia.');
        return;
    }

    const texto = idFicha
        ? 'Todos os campos serão apagados. A ficha salva só muda quando você clicar em Salvar.'
        : 'Todos os campos preenchidos serão apagados.';
    if (!await confirmarModal('Deseja realmente limpar a ficha?', texto)) return;

    for (const campo of campos) {
        campo.value = '';
        delete campo.dataset.automatico; // valores automáticos (PV, PE, SAN...) recomeçam do zero
    }
    calcularEspacoTotal();
    calcularPesoTotal();
    // Mesmo aviso de quando a ficha é carregada: atributos, "i" e regras recomeçam dos campos vazios
    document.dispatchEvent(new Event('fichaCarregada'));

    alterado = true; // sair sem salvar ainda pergunta
    window.scrollTo({ top: 0, behavior: 'smooth' });
    avisar('Ficha limpa.');
});
