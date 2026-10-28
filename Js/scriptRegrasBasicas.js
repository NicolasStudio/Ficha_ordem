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
// Quando o valor de origem muda:
//  - defesa vazia: preenche com 10 + valor
//  - defesa com valor (inclusive editado pelo jogador): sobe ou desce a mesma diferença,
//    mantendo qualquer ajuste que o jogador tenha feito
{
    const regrasDefesa = [
        ['defesa_passiva', 'agilidade'],
        ['defesa_esquiva', 'reflexos'],
        ['defesa_bloquear', 'fortitude']
    ];
    const numero = campo => parseInt(campo.value, 10) || 0; // vazio conta como 0

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

            const atual = parseInt(defesa.value, 10);
            if (defesa.value.trim() === '') {
                defesa.value = 10 + novo;
            } else if (!isNaN(atual) && diferenca !== 0) {
                defesa.value = atual + diferenca;
            } else {
                return;
            }
            defesa.dispatchEvent(new Event('input', { bubbles: true })); // conta como alteração não salva
        });
    }
}
