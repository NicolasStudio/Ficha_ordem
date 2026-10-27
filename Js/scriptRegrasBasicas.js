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
