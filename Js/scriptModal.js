// ================= Aviso rápido (no lugar do alert) =================
// Uso: avisar('Ficha salva!')  ou  avisar('Erro ao salvar.', 'erro')
// Aparece no topo da tela e some sozinho.
export function avisar(mensagem, tipo = 'sucesso') {
    const aviso = document.createElement('div');
    aviso.className = `aviso aviso-${tipo}`;
    aviso.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');
    aviso.textContent = mensagem;
    document.body.appendChild(aviso);

    // Textos maiores ficam mais tempo na tela; erros também, para dar tempo de ler
    const tempo = Math.max(tipo === 'erro' ? 4000 : 2500, mensagem.length * 60);

    requestAnimationFrame(() => aviso.classList.add('aberto'));
    setTimeout(() => {
        aviso.classList.remove('aberto');
        setTimeout(() => aviso.remove(), 300); // espera a animação de saída
    }, tempo);
}

// Para quando a página vai mudar logo em seguida (ex.: excluir e voltar para a home):
// guarda o aviso e ele aparece na próxima página que carregar este arquivo.
export function avisarNaProximaPagina(mensagem, tipo = 'sucesso') {
    try {
        sessionStorage.setItem('avisoPendente', JSON.stringify({ mensagem, tipo }));
    } catch { /* sem sessionStorage o aviso só não aparece */ }
}

try {
    const pendente = sessionStorage.getItem('avisoPendente');
    if (pendente) {
        sessionStorage.removeItem('avisoPendente');
        const { mensagem, tipo } = JSON.parse(pendente);
        avisar(mensagem, tipo);
    }
} catch { /* ignora aviso guardado inválido */ }

// ================= Modal de confirmação =================
// Modal de confirmação no lugar do confirm() do navegador.
// Uso: if (await confirmarModal('Título', 'Texto')) { ... }
// Resolve true em "Sim"; false em "Não", Esc ou clique fora da caixa.
export function confirmarModal(titulo, texto) {
    return new Promise(resolve => {
        const fundo = document.createElement('div');
        fundo.className = 'modalFundo';
        fundo.innerHTML = `
            <div class="modalCaixa" role="alertdialog" aria-modal="true" aria-labelledby="modalTitulo" aria-describedby="modalTexto">
                <p class="modalTitulo" id="modalTitulo"></p>
                <p class="modalTexto" id="modalTexto"></p>
                <div class="modalBotoes">
                    <button type="button" class="modalNao">Não</button>
                    <button type="button" class="modalSim">Sim</button>
                </div>
            </div>`;
        fundo.querySelector('.modalTitulo').textContent = titulo;
        fundo.querySelector('.modalTexto').textContent = texto;

        const focoAnterior = document.activeElement;

        function fechar(resposta) {
            document.removeEventListener('keydown', teclado);
            fundo.classList.remove('aberto');
            setTimeout(() => fundo.remove(), 200); // espera a animação de saída
            if (focoAnterior) focoAnterior.focus();
            resolve(resposta);
        }

        function teclado(event) {
            if (event.key === 'Escape') fechar(false);
        }

        fundo.querySelector('.modalNao').addEventListener('click', () => fechar(false));
        fundo.querySelector('.modalSim').addEventListener('click', () => fechar(true));
        fundo.addEventListener('click', event => {
            if (event.target === fundo) fechar(false); // clique fora da caixa
        });
        document.addEventListener('keydown', teclado);

        document.body.appendChild(fundo);
        requestAnimationFrame(() => fundo.classList.add('aberto'));
        fundo.querySelector('.modalNao').focus(); // Enter sem pensar não apaga nada
    });
}

// ================= Peças do conteúdo do modal de informação =================
export function paragrafo(texto, classe) {
    const p = document.createElement('p');
    if (classe) p.className = classe;
    p.textContent = texto;
    return p;
}

// Rótulo em destaque seguido do texto, como no livro: "Perícias Treinadas. Pontaria e Tática."
export function linhaComRotulo(rotulo, texto) {
    const p = document.createElement('p');
    const destaque = document.createElement('strong');
    destaque.className = 'rotuloDestaque';
    destaque.textContent = rotulo;
    p.append(destaque, ' ' + texto);
    return p;
}

// ================= Modal de informação =================
// Mostra um conteúdo só para leitura. Fecha em "Fechar", Esc ou clique fora da caixa.
// Uso: modalInformacao('Título', elementoComOConteudo)
export function modalInformacao(titulo, conteudo) {
    const fundo = document.createElement('div');
    fundo.className = 'modalFundo';
    fundo.innerHTML = `
        <div class="modalCaixa modalInfo" role="dialog" aria-modal="true" aria-labelledby="modalTitulo">
            <p class="modalInfoTitulo" id="modalTitulo"></p>
            <div class="modalInfoConteudo"></div>
            <div class="modalBotoes">
                <button type="button" class="modalNao">Fechar</button>
            </div>
        </div>`;
    fundo.querySelector('.modalInfoTitulo').textContent = titulo;
    fundo.querySelector('.modalInfoConteudo').appendChild(conteudo);

    const focoAnterior = document.activeElement;

    function fechar() {
        document.removeEventListener('keydown', teclado);
        fundo.classList.remove('aberto');
        setTimeout(() => fundo.remove(), 200); // espera a animação de saída
        if (focoAnterior) focoAnterior.focus();
    }

    function teclado(event) {
        if (event.key === 'Escape') fechar();
    }

    fundo.querySelector('.modalNao').addEventListener('click', fechar);
    fundo.addEventListener('click', event => {
        if (event.target === fundo) fechar(); // clique fora da caixa
    });
    document.addEventListener('keydown', teclado);

    document.body.appendChild(fundo);
    requestAnimationFrame(() => fundo.classList.add('aberto'));
    fundo.querySelector('.modalNao').focus();
}
