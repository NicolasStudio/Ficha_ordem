// Recebido do mestre: itens, UpGrades e habilidades enviados pela página enviar.html.
// Cada envio fica na coleção "envios" até o jogador confirmar. Com a ficha aberta, o modal aparece na hora.
// Ao confirmar: a ficha é salva (se tiver alterações), recebe o envio, é salva de novo e a página
// recarrega para mostrar.
//   Item: entra na primeira linha vazia do inventário
//   UpGrade e Habilidade: o texto é incluído no campo UpGrade / Habilidades, abaixo do que já houver
import { db } from "./scriptFirebase.js";
import { idFicha, usuario, somenteLeitura, temAlteracoes, salvarFichaAberta } from "./scriptFicha.js";
import { modalConfirmar, paragrafo, linhaComRotulo, avisar, avisarNaProximaPagina } from "./scriptModal.js";
import { LINHAS_INVENTARIO, linhaOcupada } from "./regrasInventario.js";
import { collection, query, where, onSnapshot, doc }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const TITULO = 'Você recebeu informações do Mestre';

// UpGrade e Habilidade: nome mostrado, campo da ficha que recebe o texto, título desse campo
// e o aviso depois de receber
const TEXTOS = {
    upgrade: { nome: 'UpGrade', campo: 'upgrade', titulo: 'UpGrade', aviso: 'UpGrade incluído na ficha.' },
    habilidade: { nome: 'Habilidade', campo: 'habilidades', titulo: 'Habilidades', aviso: 'Habilidade incluída na ficha.' }
};

let pendentes = [];
let mostrando = false;
const vistos = new Set(); // não mostra de novo o que já apareceu nesta página

// Só na ficha salva do próprio jogador (o mestre vendo a ficha de outro não recebe nada)
if (idFicha && !somenteLeitura) {
    const consulta = query(collection(db, 'envios'),
        where('uid', '==', usuario.uid), where('fichaId', '==', idFicha));

    onSnapshot(consulta, snap => {
        pendentes = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (a.criadoEm?.toMillis?.() ?? 0) - (b.criadoEm?.toMillis?.() ?? 0));
        mostrarProximo();
    }, error => console.error('Erro ao buscar o que o mestre enviou:', error));
}

async function mostrarProximo() {
    if (mostrando) return;
    const envio = pendentes.find(e => !vistos.has(e.id));
    if (!envio) return;

    mostrando = true;
    vistos.add(envio.id);
    const recarregar = await receber(envio);
    mostrando = false;
    if (!recarregar) mostrarProximo();
}

// Conteúdo do modal
function conteudoItem(envio) {
    const conteudo = document.createElement('div');
    conteudo.append(paragrafo('Incremente na ficha:'), linhaComRotulo('Item.', envio.item || ''));
    if (envio.detalhes) conteudo.append(linhaComRotulo('Detalhes.', envio.detalhes));
    conteudo.append(
        linhaComRotulo('Espaço.', envio.espaco || '0'),
        linhaComRotulo('Peso.', envio.peso || '0'),
        paragrafo('Ao confirmar, o item entra no seu inventário e a ficha é salva.', 'notaRecebido')
    );
    return conteudo;
}

function conteudoTexto(envio) {
    const { nome, titulo } = TEXTOS[envio.tipo];
    const conteudo = document.createElement('div');
    conteudo.append(
        paragrafo('Incremente na ficha:'),
        linhaComRotulo(nome + '.', ''),
        paragrafo(envio.texto || '', 'textoRecebido'),
        paragrafo(`Ao confirmar, o texto é incluído no campo ${titulo} da ficha, abaixo do que já houver, e a ficha é salva.`, 'notaRecebido')
    );
    return conteudo;
}

// Item: primeira linha vazia do inventário. Devolve a mensagem de sucesso, ou null se não couber.
function incluirItem(envio) {
    const campo = nome => document.getElementById(nome);
    let linha = 1;
    while (linha <= LINHAS_INVENTARIO && linhaOcupada(nome => campo(nome).value, linha)) linha++;
    if (linha > LINHAS_INVENTARIO) {
        avisar(`Seu inventário está cheio. Libere uma linha para receber "${envio.item}" (aparece de novo ao abrir a ficha).`, 'erro');
        return null;
    }

    campo('item' + linha).value = envio.item || '';
    campo('info' + linha).value = envio.detalhes || '';
    campo('espaco' + linha).value = envio.espaco || '';
    campo('peso' + linha).value = envio.peso || '';
    calcularEspacoTotal();
    calcularPesoTotal();
    // Mesmo caminho de quando o jogador digita: atualiza a carga e, se passar do limite,
    // avisa do sobrepeso e aplica o –5 nas defesas (scriptInventario.js)
    campo('item' + linha).dispatchEvent(new Event('input', { bubbles: true }));
    return `"${envio.item}" foi adicionado ao seu inventário.`;
}

// UpGrade e Habilidade: na linha de baixo do texto que já existe, sem apagar nada
function incluirTexto(envio) {
    const { campo: nomeCampo, aviso } = TEXTOS[envio.tipo];
    const campo = document.getElementById(nomeCampo);
    const atual = campo.value.replace(/\s+$/, '');
    campo.value = atual ? `${atual}\n${envio.texto}` : envio.texto;
    campo.dispatchEvent(new Event('input', { bubbles: true }));
    return aviso;
}

// Devolve true quando a página vai recarregar
async function receber(envio) {
    const ehItem = envio.tipo === 'item';
    if (!ehItem && !TEXTOS[envio.tipo]) return false; // tipo desconhecido: ignora

    await modalConfirmar(TITULO, ehItem ? conteudoItem(envio) : conteudoTexto(envio));

    let mensagem;
    try {
        // 1. Salva o que o jogador já tinha alterado
        if (temAlteracoes()) await salvarFichaAberta();

        // 2. Recebe
        mensagem = ehItem ? incluirItem(envio) : incluirTexto(envio);
        if (!mensagem) return false;

        // 3. Salva de novo, apagando o envio na mesma operação (não recebe duas vezes)
        await salvarFichaAberta(doc(db, 'envios', envio.id));
    } catch (error) {
        console.error('Erro ao receber:', error);
        avisar('Não foi possível receber. Tente abrir a ficha de novo.', 'erro');
        return false;
    }

    // 4. Recarrega para mostrar a ficha atualizada (o aviso de sobrepeso aparece de novo ao abrir)
    avisarNaProximaPagina(mensagem);
    window.location.reload();
    return true;
}
