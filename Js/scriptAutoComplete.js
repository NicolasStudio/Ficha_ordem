// Auto-complete reutilizável para campos de texto (ex.: Origem e Classe).
// Ao clicar lista os nomes (A-Z) e filtra enquanto digita; aceita texto fora da lista.
// Quando o campo tem um item da lista, aparece um "i" que abre os detalhes num modal.
//
// Uso:
//   autoComplete({
//       campo: document.getElementById('origem'),
//       itens: origensInfo,              // objetos com "name"
//       tipo: 'origem',                  // usado no texto de acessibilidade do "i"
//       detalhes: item => elementoDOM,   // conteúdo do modal
//       aoEscolher: item => { ... }      // opcional: o jogador escolheu um item da lista
//   });
import { modalInformacao } from "./scriptModal.js";

// Ignora acentos e maiúsculas: "academico" encontra "Acadêmico"
const semAcento = texto => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Procura pelo começo das palavras: "mi" acha "Militar" (e não "Acadêmico");
// "rural" acha "Trabalhador Rural"
function combina(nome, busca) {
    const texto = semAcento(nome);
    return texto.startsWith(busca) || texto.split(/[\s.]+/).some(palavra => palavra.startsWith(busca));
}

export function autoComplete({ campo, itens, tipo, detalhes, aoEscolher = () => {} }) {
    // Envolve o campo: a lista e o "i" ficam presos a ele pelo CSS e acompanham
    // qualquer mudança de layout (fonte carregando, tela redimensionada...)
    const envoltorio = document.createElement('span');
    envoltorio.className = 'campoComLista';
    campo.before(envoltorio);
    envoltorio.appendChild(campo);

    const lista = document.createElement('ul');
    lista.className = 'listaOpcoes';
    lista.id = 'lista-' + campo.id;
    lista.setAttribute('role', 'listbox');
    envoltorio.appendChild(lista);

    campo.setAttribute('role', 'combobox');
    campo.setAttribute('aria-autocomplete', 'list');
    campo.setAttribute('aria-controls', lista.id);
    campo.setAttribute('aria-expanded', 'false');

    const nomes = itens.map(item => item.name).sort((a, b) => a.localeCompare(b, 'pt-BR'));

    let opcoes = [];  // nomes mostrados agora
    let ativa = -1;   // índice destacado pelas setas

    function abrir() {
        const busca = semAcento(campo.value.trim());
        opcoes = nomes.filter(nome => combina(nome, busca));

        // Se o texto já é exatamente um item, mostra a lista toda para poder trocar
        if (opcoes.length === 1 && semAcento(opcoes[0]) === busca) opcoes = nomes;

        if (opcoes.length === 0) return fechar();

        lista.innerHTML = '';
        opcoes.forEach((nome, i) => {
            const item = document.createElement('li');
            item.id = `${campo.id}-opcao-${i}`;
            item.setAttribute('role', 'option');
            item.textContent = nome;
            item.addEventListener('click', () => escolher(nome));
            lista.appendChild(item);
        });

        // Abre alinhada pela esquerda do campo...
        lista.classList.remove('alinhadaDireita');
        lista.classList.add('aberta');

        // ...ou pela direita, se passar da borda direita da tela
        if (lista.getBoundingClientRect().right > document.documentElement.clientWidth - 8) {
            lista.classList.add('alinhadaDireita');
        }
        campo.setAttribute('aria-expanded', 'true');
        destacar(-1);
    }

    function fechar() {
        lista.classList.remove('aberta');
        campo.setAttribute('aria-expanded', 'false');
        campo.removeAttribute('aria-activedescendant');
        ativa = -1;
    }

    function destacar(indice) {
        ativa = indice;
        [...lista.children].forEach((item, i) => item.classList.toggle('ativa', i === indice));
        if (indice >= 0) {
            const item = lista.children[indice];
            item.scrollIntoView({ block: 'nearest' });
            campo.setAttribute('aria-activedescendant', item.id);
        } else {
            campo.removeAttribute('aria-activedescendant');
        }
    }

    function escolher(nome) {
        campo.value = nome;
        // Avisa a ficha que houve alteração (para o aviso de "dados não salvos")
        campo.dispatchEvent(new Event('input', { bubbles: true }));
        fechar();
        aoEscolher(itens.find(item => item.name === nome));
    }

    // ================= Botão "i" com os detalhes =================
    const botaoInfo = document.createElement('button');
    botaoInfo.type = 'button';
    botaoInfo.className = 'infoCampo';
    botaoInfo.textContent = 'i';
    botaoInfo.hidden = true;
    envoltorio.appendChild(botaoInfo);

    // Item da lista que corresponde ao texto do campo (ignorando acentos e maiúsculas)
    function itemDoCampo() {
        const texto = semAcento(campo.value.trim());
        return itens.find(item => semAcento(item.name) === texto);
    }

    function atualizarBotaoInfo() {
        const item = itemDoCampo();
        botaoInfo.hidden = !item;
        campo.classList.toggle('comInfo', !!item); // abre espaço para o "i" dentro do campo
        if (item) botaoInfo.setAttribute('aria-label', `Ver detalhes da ${tipo} ${item.name}`);
    }

    botaoInfo.addEventListener('click', () => {
        const item = itemDoCampo();
        if (item) modalInformacao(item.name, detalhes(item));
    });

    campo.addEventListener('input', atualizarBotaoInfo);

    // Digitou o nome exato e saiu do campo, sem usar a lista: também conta como escolha
    campo.addEventListener('change', () => {
        const item = itemDoCampo();
        if (item) aoEscolher(item);
    });
    // A ficha preenche os campos sem disparar "input"; ela avisa quando terminou de carregar
    document.addEventListener('fichaCarregada', atualizarBotaoInfo);
    atualizarBotaoInfo();

    campo.addEventListener('focus', abrir);
    campo.addEventListener('click', abrir);
    campo.addEventListener('input', event => {
        // O input disparado por escolher() não deve reabrir a lista
        if (event.isTrusted) abrir();
    });

    campo.addEventListener('keydown', event => {
        const aberta = lista.classList.contains('aberta');

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!aberta) return abrir();
            destacar(Math.min(ativa + 1, opcoes.length - 1));
        } else if (event.key === 'ArrowUp' && aberta) {
            event.preventDefault();
            destacar(Math.max(ativa - 1, 0));
        } else if (event.key === 'Enter' && aberta && ativa >= 0) {
            event.preventDefault(); // não envia o formulário, só escolhe a opção
            escolher(opcoes[ativa]);
        } else if (event.key === 'Escape' && aberta) {
            fechar();
        }
    });

    // Clicar na lista não pode tirar o foco do campo antes do clique valer
    lista.addEventListener('mousedown', event => event.preventDefault());
    campo.addEventListener('blur', fechar);
}
