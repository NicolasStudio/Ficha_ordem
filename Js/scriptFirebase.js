// Inicializa o Firebase e expõe autenticação (auth) e banco (db) para as páginas
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebaseConfig.js";
import { TABLETOP_URL } from "./tabletopConfig.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ================= Ficha aberta dentro da mesa (Tabletop) =================
// Dentro de outro site o navegador costuma bloquear o login salvo da Ficha. Então,
// sem login, a página pede um à mesa (botão 📜 Ficha do Tabletop), que responde
// com um custom token do Firebase da conta do jogador. Só a mesa conversa com a
// Ficha: endereço público (Js/tabletopConfig.js) e os do Tabletop local.
export const ORIGENS_DA_MESA = [new URL(TABLETOP_URL).origin, 'http://localhost:5173', 'http://localhost:4173'];
export const dentroDaMesa = window.parent !== window;
let entrandoPelaMesa = null; // um pedido só por página, mesmo com vários exigirLogin

function entrarPelaMesa() {
    if (entrandoPelaMesa) return entrandoPelaMesa;
    entrandoPelaMesa = new Promise((resolve, reject) => {
        const tempo = setTimeout(() => {
            parar();
            reject(new Error('A mesa não respondeu.'));
        }, 10000);

        function parar() {
            window.removeEventListener('message', resposta);
            clearTimeout(tempo);
        }

        function resposta(event) {
            if (event.source !== window.parent || !ORIGENS_DA_MESA.includes(event.origin)) return;
            if (event.data?.type === 'ficha:login') {
                parar();
                signInWithCustomToken(auth, event.data.token).then(credencial => resolve(credencial.user), reject);
            } else if (event.data?.type === 'ficha:login-erro') {
                parar();
                reject(new Error(event.data.message));
            }
        }

        window.addEventListener('message', resposta);
        // a mensagem só chega se a página de fora for mesmo uma dessas origens
        for (const origem of ORIGENS_DA_MESA) window.parent.postMessage({ type: 'ficha:pedir-login' }, origem);
    });
    return entrandoPelaMesa;
}

// Espera o Firebase dizer quem está logado; se ninguém, volta para o login
// (dentro da mesa, antes tenta entrar pela conta da mesa)
export function exigirLogin() {
    return new Promise(resolve => {
        const parar = onAuthStateChanged(auth, usuario => {
            parar();
            if (usuario) {
                resolve(usuario);
            } else if (dentroDaMesa) {
                entrarPelaMesa().then(resolve, error => {
                    console.error('Não foi possível entrar pela mesa:', error);
                    window.location.replace("index.html");
                });
            } else {
                window.location.replace("index.html");
            }
        });
    });
}

// Usado pelo botão "Sair" (onclick="sair()")
window.sair = async function () {
    await signOut(auth);
    window.location.replace("index.html");
};
