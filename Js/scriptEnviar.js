// Enviar itens (enviar.html): o mestre escolhe o jogador, o personagem e o que enviar.
// O envio fica na coleção "envios" até o jogador confirmar na ficha (scriptRecebimentos.js).
import { db } from "./scriptFirebase.js";
import { exigirMestre } from "./mestres.js";
import { avisar, confirmarModal } from "./scriptModal.js";
import { autoComplete } from "./scriptAutoComplete.js";
import { LINHAS_INVENTARIO, capacidadeDeCarga, numero, linhaOcupada } from "./regrasInventario.js";
import { collection, getDocs, getDoc, addDoc, doc, query, where, serverTimestamp }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const mestre = await exigirMestre();
document.body.style.visibility = '';

const filtro = document.getElementById('filtroJogador');
const mensagemJogadores = document.getElementById('mensagemJogadores');
const listaPersonagens = document.getElementById('listaPersonagens');
const passoPersonagem = document.getElementById('passoPersonagem');
const passoEnvio = document.getElementById('passoEnvio');
const resumo = document.getElementById('resumoInventario');
const form = document.getElementById('formEnvio');
const abas = [...document.querySelectorAll('.abaEnvio')];
const painelItem = document.getElementById('painelItem');
const painelTexto = document.getElementById('painelTexto');
const rotuloTexto = document.getElementById('rotuloTexto');
const campos = {
    item: document.getElementById('envioItem'),
    detalhes: document.getElementById('envioDetalhes'),
    espaco: document.getElementById('envioEspaco'),
    peso: document.getElementById('envioPeso'),
    texto: document.getElementById('envioTexto')
};

const ROTULOS_TEXTO = {
    upgrade: 'O que o personagem ganhou (UpGrade)',
    habilidade: 'Habilidade que o personagem ganhou'
};
const NOTAS_TEXTO = {
    upgrade: 'Ao confirmar, o texto entra no campo UpGrade da ficha, abaixo do que já houver.',
    habilidade: 'Ao confirmar, o texto entra no campo Habilidades da ficha, abaixo do que já houver.'
};

let jogadores = [];          // [{ uid, name, fichas: [...] }] ("name" é o que o auto-complete mostra)
let jogadorEscolhido = null;
let fichaEscolhida = null;
let tipo = 'item';

// "1,5" para mostrar
const formatar = valor => valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

function botaoEscolha(titulo, detalhe, aoEscolher) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'opcaoEscolha';
    botao.setAttribute('aria-pressed', 'false');
    const strong = document.createElement('strong');
    strong.textContent = titulo;
    botao.appendChild(strong);
    if (detalhe) {
        const span = document.createElement('span');
        span.textContent = detalhe;
        botao.appendChild(span);
    }
    botao.addEventListener('click', () => {
        for (const outro of botao.parentElement.children) outro.setAttribute('aria-pressed', 'false');
        botao.setAttribute('aria-pressed', 'true');
        aoEscolher();
    });
    return botao;
}

// ================= 1. Jogadores =================
async function carregarJogadores() {
    let fichasSnap, usuariosSnap;
    try {
        [fichasSnap, usuariosSnap] = await Promise.all([
            getDocs(collection(db, 'fichas')),
            getDocs(collection(db, 'usuarios'))
        ]);
    } catch (error) {
        console.error(error);
        mostrarMensagem('Não foi possível carregar os jogadores. Recarregue a página.');
        return;
    }

    // Todos que têm ficha, inclusive o mestre (ex.: um NPC)
    const nomes = Object.fromEntries(usuariosSnap.docs.map(d => [d.id, d.data().nome || d.data().email || '']));
    const porJogador = new Map();
    for (const d of fichasSnap.docs) {
        const ficha = { id: d.id, ...d.data() };
        if (!porJogador.has(ficha.uid)) {
            const nome = nomes[ficha.uid] || 'Jogador sem cadastro';
            porJogador.set(ficha.uid, { uid: ficha.uid, name: ficha.uid === mestre.uid ? `${nome} (você)` : nome, fichas: [] });
        }
        porJogador.get(ficha.uid).fichas.push(ficha);
    }

    jogadores = [...porJogador.values()];
    for (const jogador of jogadores) {
        jogador.fichas.sort((a, b) => (a.nomePersonagem || '').localeCompare(b.nomePersonagem || '', 'pt-BR'));
    }

    if (jogadores.length === 0) {
        mostrarMensagem('Nenhuma ficha cadastrada ainda.');
        return;
    }
    autoComplete({ campo: filtro, itens: jogadores, tipo: 'jogador', aoEscolher: escolherJogador });
}

function mostrarMensagem(texto) {
    mensagemJogadores.textContent = texto;
    mensagemJogadores.hidden = false;
    filtro.disabled = true;
}

// Mudou o texto depois de escolher: esconde os passos seguintes até escolher de novo
filtro.addEventListener('input', () => {
    if (jogadorEscolhido && filtro.value.trim() !== jogadorEscolhido.name) {
        jogadorEscolhido = null;
        fichaEscolhida = null;
        passoPersonagem.hidden = true;
        passoEnvio.hidden = true;
    }
});

// ================= 2. Personagens =================
function escolherJogador(jogador) {
    if (jogador === jogadorEscolhido) return; // "change" depois de escolher pela lista
    jogadorEscolhido = jogador;
    fichaEscolhida = null;
    passoEnvio.hidden = true;
    passoPersonagem.hidden = false;
    document.getElementById('nomeJogador').textContent = jogador.name;

    listaPersonagens.innerHTML = '';
    for (const ficha of jogador.fichas) {
        const detalhe = [ficha.nivelNext ? `NEX ${ficha.nivelNext}%` : '', ficha.classe].filter(Boolean).join(' · ');
        listaPersonagens.appendChild(botaoEscolha(ficha.nomePersonagem || 'Sem nome', detalhe, () => escolherFicha(ficha)));
    }

    // Um personagem só: já escolhe
    if (jogador.fichas.length === 1) listaPersonagens.firstElementChild.click();
    passoPersonagem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ================= 3. Inventário e envio =================
// Situação atual do inventário: ficha salva + itens enviados que o jogador ainda não confirmou
async function situacaoInventario(fichaId) {
    const [fichaSnap, enviosSnap] = await Promise.all([
        getDoc(doc(db, 'fichas', fichaId)),
        getDocs(query(collection(db, 'envios'), where('fichaId', '==', fichaId)))
    ]);
    const ficha = fichaSnap.data() || {};
    const aguardando = enviosSnap.docs.map(d => d.data()).filter(envio => envio.tipo === 'item');

    let ocupadas = 0, espaco = 0, peso = 0;
    for (let linha = 1; linha <= LINHAS_INVENTARIO; linha++) {
        if (linhaOcupada(nome => ficha[nome], linha)) ocupadas++;
        espaco += numero(ficha['espaco' + linha]);
        peso += numero(ficha['peso' + linha]);
    }
    for (const envio of aguardando) {
        espaco += numero(envio.espaco);
        peso += numero(envio.peso);
    }

    return {
        ocupadas: ocupadas + aguardando.length,
        aguardando: aguardando.length,
        espaco,
        peso,
        capacidade: capacidadeDeCarga(ficha.forca)
    };
}

// Mesmas cores do inventário da ficha: verde, amarelo (75%) e vermelho (passou)
const estado = (total, limite) => total > limite ? 'cargaExcesso' : (limite > 0 && total >= limite * 0.75 ? 'cargaAlerta' : 'cargaOk');

function parteResumo(rotulo, texto, classe) {
    const span = document.createElement('span');
    span.className = 'parteResumo ' + (classe || '');
    const strong = document.createElement('strong');
    strong.textContent = rotulo + ': ';
    span.append(strong, texto);
    return span;
}

async function atualizarResumo() {
    const ficha = fichaEscolhida;
    resumo.textContent = 'Carregando o inventário...';
    let situacao;
    try {
        situacao = await situacaoInventario(ficha.id);
    } catch (error) {
        console.error(error);
        resumo.textContent = 'Não foi possível ler o inventário deste personagem.';
        return;
    }
    if (ficha !== fichaEscolhida) return; // trocou de personagem enquanto carregava

    const { ocupadas, aguardando, espaco, peso, capacidade } = situacao;
    const cheio = ocupadas >= LINHAS_INVENTARIO;
    resumo.innerHTML = '';
    resumo.append(
        parteResumo('Itens', `${ocupadas}/${LINHAS_INVENTARIO}` + (aguardando ? ` (${aguardando} aguardando o jogador)` : ''), cheio ? 'cargaExcesso' : ''),
        parteResumo('Espaço', `${formatar(espaco)}/${capacidade}`, estado(espaco, capacidade)),
        parteResumo('Peso', `${formatar(peso)}/${capacidade}`, estado(peso, capacidade))
    );
    if (cheio) {
        const aviso = document.createElement('p');
        aviso.className = 'avisoInventarioCheio';
        aviso.textContent = 'Inventário cheio: não é possível enviar itens para este personagem.';
        resumo.appendChild(aviso);
    }
}

function escolherFicha(ficha) {
    fichaEscolhida = ficha;
    passoEnvio.hidden = false;
    document.getElementById('nomePersonagem').textContent = ficha.nomePersonagem || 'Sem nome';
    atualizarResumo();
    passoEnvio.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ================= Abas: Item | UpGrade | Habilidade =================
function escolherAba(novoTipo) {
    tipo = novoTipo;
    for (const aba of abas) aba.setAttribute('aria-selected', String(aba.dataset.tipo === tipo));
    painelItem.hidden = tipo !== 'item';
    painelTexto.hidden = tipo === 'item';
    if (tipo !== 'item') {
        rotuloTexto.textContent = ROTULOS_TEXTO[tipo];
        document.getElementById('notaTexto').textContent = NOTAS_TEXTO[tipo];
    }
}

for (const aba of abas) aba.addEventListener('click', () => escolherAba(aba.dataset.tipo));

// Setas esquerda/direita trocam de aba
document.querySelector('.abasEnvio').addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const atual = abas.findIndex(aba => aba.dataset.tipo === tipo);
    const proxima = abas[(atual + (event.key === 'ArrowRight' ? 1 : abas.length - 1)) % abas.length];
    escolherAba(proxima.dataset.tipo);
    proxima.focus();
});

// ================= Enviar e Limpar =================
const camposDaAba = () => tipo === 'item'
    ? [campos.item, campos.detalhes, campos.espaco, campos.peso]
    : [campos.texto];

// Espaço e peso: vazio ou número (aceita vírgula)
const numeroValido = texto => texto === '' || /^\d+([.,]\d+)?$/.test(texto);

function erro(campo, texto) {
    avisar(texto, 'erro');
    campo.focus();
}

form.addEventListener('submit', async event => {
    event.preventDefault();
    const botao = form.querySelector('.btnSalvar');
    if (botao.disabled || !fichaEscolhida) return;

    const valores = Object.fromEntries(Object.entries(campos).map(([nome, campo]) => [nome, campo.value.trim()]));
    const envio = {
        fichaId: fichaEscolhida.id,
        uid: fichaEscolhida.uid,
        mestreUid: mestre.uid,
        nomePersonagem: fichaEscolhida.nomePersonagem || '',
        tipo,
        criadoEm: serverTimestamp()
    };

    if (tipo === 'item') {
        if (!valores.item) return erro(campos.item, 'Informe o nome do item.');
        if (!numeroValido(valores.espaco)) return erro(campos.espaco, 'Espaço deve ser um número (ex.: 1 ou 0,5).');
        if (!numeroValido(valores.peso)) return erro(campos.peso, 'Peso deve ser um número (ex.: 1 ou 0,5).');
        Object.assign(envio, { item: valores.item, detalhes: valores.detalhes, espaco: valores.espaco, peso: valores.peso });
    } else {
        if (!valores.texto) return erro(campos.texto, 'Escreva o que o personagem ganhou.');
        envio.texto = valores.texto;
    }

    botao.disabled = true;
    try {
        if (tipo === 'item') {
            // Confere de novo na hora de enviar: o jogador pode ter mudado o inventário
            const situacao = await situacaoInventario(fichaEscolhida.id);
            if (situacao.ocupadas >= LINHAS_INVENTARIO) {
                avisar(`Inventário cheio: ${envio.nomePersonagem || 'o personagem'} não tem espaço para mais itens.`, 'erro');
                atualizarResumo();
                return;
            }
            const espaco = situacao.espaco + numero(envio.espaco);
            const peso = situacao.peso + numero(envio.peso);
            if (espaco > situacao.capacidade || peso > situacao.capacidade) {
                const texto = `Espaço ${formatar(espaco)}/${situacao.capacidade} e peso ${formatar(peso)}/${situacao.capacidade}. ` +
                    'O jogador será avisado do sobrepeso ao receber.';
                if (!await confirmarModal('O personagem ficará sobrecarregado. Enviar mesmo assim?', texto)) return;
            }
        }

        await addDoc(collection(db, 'envios'), envio);
        const enviado = { item: `"${envio.item}" enviado`, upgrade: 'UpGrade enviado', habilidade: 'Habilidade enviada' };
        avisar(`${enviado[tipo]} para ${envio.nomePersonagem || 'o personagem'}!`);
        for (const campo of camposDaAba()) campo.value = '';
        atualizarResumo();
    } catch (error) {
        console.error('Erro ao enviar:', error);
        avisar('Não foi possível enviar. Tente de novo.', 'erro');
    } finally {
        botao.disabled = false;
    }
});

form.querySelector('.btnLimpar').addEventListener('click', () => {
    const preenchidos = camposDaAba().filter(campo => campo.value.trim() !== '');
    if (preenchidos.length === 0) {
        avisar('Os campos já estão vazios.');
        return;
    }
    for (const campo of camposDaAba()) campo.value = '';
    camposDaAba()[0].focus();
});

carregarJogadores();
