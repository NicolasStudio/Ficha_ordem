// Entrada no Tabletop (tabletop.html), aberta pelo menu ☰ → Tabletop numa nova guia.
// O Tabletop roda no PC do mestre e só funciona quando ele está ligado:
//   ligado   -> entra direto com a conta da Ficha (sem novo login) e no tema da Ficha
//   desligado -> mostra "offline" e tenta de novo sozinho de tempos em tempos
import { db, exigirLogin } from "./scriptFirebase.js";
import { TABLETOP_URL } from "./tabletopConfig.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const INTERVALO = 15; // segundos entre as tentativas
const TEMPO_LIMITE = 5000; // ms esperando a resposta do Tabletop

const usuario = await exigirLogin();

const caixa = document.querySelector('.estadoTabletop');
const titulo = caixa.querySelector('.tituloEstado');
const texto = caixa.querySelector('.textoEstado');
const botaoTentar = document.querySelector('.btnTentar');

let contagem = null;

function mostrar(estado, tituloEstado, textoEstado = '') {
    caixa.dataset.estado = estado;
    titulo.textContent = tituloEstado;
    texto.textContent = textoEstado;
    botaoTentar.hidden = estado !== 'offline' && estado !== 'erro';
}

// O Tabletop responde {status: 'ok'} em /api/health quando está ligado
async function estaOnline() {
    const controle = new AbortController();
    const limite = setTimeout(() => controle.abort(), TEMPO_LIMITE);
    try {
        const resposta = await fetch(`${TABLETOP_URL}/api/health`, { signal: controle.signal, cache: 'no-store' });
        return resposta.ok && (await resposta.json()).status === 'ok';
    } catch {
        return false; // desligado, sem rede ou endereço errado
    } finally {
        clearTimeout(limite);
    }
}

// Abre a sessão no Tabletop com a conta da Ficha: envia o login do Firebase (ID token)
// num formulário. Esta guia passa a ser o Tabletop.
async function entrar() {
    mostrar('entrando', 'Tabletop online!', 'Entrando com a sua conta da Ficha...');

    let nome = '';
    try {
        const cadastro = await getDoc(doc(db, 'usuarios', usuario.uid));
        nome = cadastro.data()?.nome || '';
    } catch (error) {
        console.error('Erro ao buscar o nome do jogador:', error); // o Tabletop usa o e-mail
    }

    const campos = {
        idToken: await usuario.getIdToken(),
        name: nome,
        theme: document.documentElement.dataset.tema || 'classico'
    };

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${TABLETOP_URL}/api/auth/firebase`;
    form.hidden = true;
    for (const [nomeCampo, valor] of Object.entries(campos)) {
        const campo = document.createElement('input');
        campo.type = 'hidden';
        campo.name = nomeCampo;
        campo.value = valor;
        form.appendChild(campo);
    }
    document.body.appendChild(form);
    form.submit();
}

function esperarNovaTentativa() {
    let restante = INTERVALO;
    const atualizar = () => mostrar('offline', 'O Tabletop está offline',
        `O mestre ainda não ligou a mesa. Nova tentativa em ${restante} s.`);
    atualizar();
    contagem = setInterval(() => {
        restante--;
        if (restante <= 0) verificar();
        else atualizar();
    }, 1000);
}

async function verificar() {
    clearInterval(contagem);
    mostrar('verificando', 'Procurando o Tabletop...');
    if (!await estaOnline()) return esperarNovaTentativa();

    try {
        await entrar();
    } catch (error) {
        console.error('Erro ao entrar no Tabletop:', error);
        mostrar('erro', 'Não foi possível entrar no Tabletop', 'Tente de novo em instantes.');
    }
}

botaoTentar.addEventListener('click', verificar);

// Voltou para esta guia (ex.: depois de ligar o Tabletop): confere na hora
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && caixa.dataset.estado === 'offline') verificar();
});

verificar();
