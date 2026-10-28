// Contas de mestre: UID do Firebase Authentication (Console > Authentication > Users > "UID do usuário").
// IMPORTANTE: a mesma lista precisa estar em firestore.rules (função ehMestre).
// Esta lista só muda a interface; quem de fato libera o acesso às fichas são as regras do Firestore.
import { exigirLogin } from "./scriptFirebase.js";

export const MESTRES = ['YSf9WSBKHIUH5nwnECRSZPlGqf33'];

export const ehMestre = usuario => !!usuario && MESTRES.includes(usuario.uid);

// Para onde ir depois do login: o mestre passa pelo menu antes
export const paginaInicial = usuario => ehMestre(usuario) ? 'mestre.html' : 'home.html';

// Páginas só do mestre: quem não é mestre volta para a home
export async function exigirMestre() {
    const usuario = await exigirLogin();
    if (!ehMestre(usuario)) {
        window.location.replace('home.html');
        return new Promise(() => {}); // não continua a página enquanto redireciona
    }
    return usuario;
}
