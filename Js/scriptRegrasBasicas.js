function calcularEspacoTotal() {
    let total = 0;

    // Pega todos os inputs de espaço
    for (let i = 1; i <= 8; i++) {
        let valor = document.getElementById('espaco' + i).value;

        // Substitui a vírgula por ponto e converte para número
        if (valor) {
            valor = parseFloat(valor.replace(',', '.'));
            if (!isNaN(valor)) {
                total += valor;
            }
        }
    }

    // Atualiza o campo total
    document.getElementById('espacoTotal').value = total.toFixed(2).replace('.', ',');
}


function calcularPesoTotal() {
    let total = 0;

    // Pega todos os inputs de peso
    for (let i = 1; i <= 8; i++) {
        let valor = document.getElementById('peso' + i).value;

        // Substitui a vírgula por ponto e converte para número
        if (valor) {
            valor = parseFloat(valor.replace(',', '.'));
            if (!isNaN(valor)) {
                total += valor;
            }
        }
    }

    // Atualiza o campo total
    document.getElementById('pesoTotal').value = total.toFixed(2).replace('.', ',');
}


// ================= Defesas =================
// Passiva = 10 + AGI | Esquiva = 10 + Reflexos | Bloquear = 10 + Fortitude
// Sobrecarregado (inventário acima da capacidade): a base cai de 10 para 5 (–5 em Defesa)
// Quando o valor de origem muda:
//  - defesa vazia: preenche com base + valor
//  - defesa com valor (inclusive editado pelo jogador): sobe ou desce a mesma diferença,
//    mantendo qualquer ajuste que o jogador tenha feito
{
    const regrasDefesa = [
        ['defesa_passiva', 'agilidade'],
        ['defesa_esquiva', 'reflexos'],
        ['defesa_bloquear', 'fortitude']
    ];
    const PENALIDADE_SOBRECARGA = 5;
    const numero = campo => parseInt(campo.value, 10) || 0; // vazio conta como 0
    let sobrecarregado = false;

    const baseDefesa = () => 10 - (sobrecarregado ? PENALIDADE_SOBRECARGA : 0);

    // Soma (ou tira) um valor da defesa, se ela tiver número
    function ajustarDefesa(defesa, diferenca) {
        const atual = parseInt(defesa.value, 10);
        if (isNaN(atual) || diferenca === 0) return;
        defesa.value = atual + diferenca;
        defesa.dispatchEvent(new Event('input', { bubbles: true })); // conta como alteração não salva
    }

    for (const [nomeDefesa, nomeOrigem] of regrasDefesa) {
        const defesa = document.querySelector(`[name="${nomeDefesa}"]`);
        const origem = document.querySelector(`[name="${nomeOrigem}"]`);
        let anterior = numero(origem);

        // Ao abrir uma ficha salva, a diferença passa a ser contada a partir do valor carregado
        document.addEventListener('fichaCarregada', () => anterior = numero(origem));

        origem.addEventListener('input', () => {
            const novo = numero(origem);
            const diferenca = novo - anterior;
            anterior = novo;

            if (defesa.value.trim() === '') {
                defesa.value = baseDefesa() + novo;
                defesa.dispatchEvent(new Event('input', { bubbles: true })); // conta como alteração não salva
            } else {
                ajustarDefesa(defesa, diferenca);
            }
        });
    }

    // Avisado pelo scriptInventario.js quando a carga muda.
    // semAjuste: ficha acabou de abrir; os valores salvos já estão com (ou sem) a penalidade
    document.addEventListener('cargaMudou', event => {
        const { sobrecarregado: agora, semAjuste } = event.detail;
        if (agora === sobrecarregado) return;
        sobrecarregado = agora;
        if (semAjuste) return;

        const diferenca = agora ? -PENALIDADE_SOBRECARGA : PENALIDADE_SOBRECARGA;
        for (const [nomeDefesa] of regrasDefesa) {
            ajustarDefesa(document.querySelector(`[name="${nomeDefesa}"]`), diferenca);
        }
    });
}
