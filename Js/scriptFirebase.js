// Inicializa o Firebase e expõe autenticação (auth) e banco (db) para as páginas
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Espera o Firebase dizer quem está logado; se ninguém, volta para o login
export function exigirLogin() {
    return new Promise(resolve => {
        const parar = onAuthStateChanged(auth, usuario => {
            parar();
            if (usuario) {
                resolve(usuario);
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
