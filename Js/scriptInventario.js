// Carga do inventário: os totais de Espaço e Peso mudam de cor conforme enchem
//   verde    -> abaixo de 75% da capacidade
//   amarelo  -> de 75% até a capacidade
//   vermelho -> passou da capacidade: sobrecarregado
// Capacidade = 10 + 5 × FOR (FOR negativa reduz 5 por ponto)
// Sobrecarregado: –5 em Defesa (aplicado nas defesas pelo scriptRegrasBasicas.js),
// –5 nos testes de perícia afetados por carga e –3m de deslocamento (só aviso)
import { avisar } from "./scriptModal.js";

const LIMITE_AMARELO = 0.75;
const MENSAGEM_SOBREPESO = 'Você está sobrecarregado: –5 em Defesa e nos testes de perícia afetados por carga, e seu deslocamento é reduzido em –3m.';

const forca = document.querySelector('[name="forca"]');
const totais = [document.getElementById('espacoTotal'), document.getElementById('pesoTotal')];
const textoCapacidade = document.querySelector('.capacidadeCarga');
const avisoSobrepeso = document.querySelector('.avisoSobrepeso');

let estavaComSobrepeso = false;

const capacidade = () => 10 + 5 * (parseInt(forca.value, 10) || 0); // FOR vazia conta como 0

// Os totais vêm no formato "1,50"
const numero = texto => parseFloat((texto || '0').replace(',', '.')) || 0;

function estadoDaCarga(total, limite) {
    if (total > limite) return 'cargaExcesso';
    if (limite > 0 && total >= limite * LIMITE_AMARELO) return 'cargaAlerta';
    return 'cargaOk';
}

// semAjuste: true ao abrir a ficha (as defesas salvas já estão com ou sem a penalidade)
function atualizarCarga(semAjuste = false) {
    const limite = capacidade();
    textoCapacidade.textContent = `Capacidade de carga: ${limite} (10 + 5 × FOR)`;

    let comSobrepeso = false;
    for (const total of totais) {
        const estado = estadoDaCarga(numero(total.value), limite);
        total.classList.remove('cargaOk', 'cargaAlerta', 'cargaExcesso');
        total.classList.add(estado);
        if (estado === 'cargaExcesso') comSobrepeso = true;
    }

    avisoSobrepeso.hidden = !comSobrepeso;
    avisoSobrepeso.textContent = comSobrepeso ? MENSAGEM_SOBREPESO : '';

    // O aviso flutuante aparece só quando entra em sobrepeso, não a cada tecla
    if (comSobrepeso && !estavaComSobrepeso) avisar(MENSAGEM_SOBREPESO, 'erro');
    estavaComSobrepeso = comSobrepeso;

    // As defesas (scriptRegrasBasicas.js) aplicam ou retiram o –5
    document.dispatchEvent(new CustomEvent('cargaMudou', { detail: { sobrecarregado: comSobrepeso, semAjuste } }));
}

// Os totais são calculados pelo oninput de cada campo (scriptRegrasBasicas.js);
// este ouvinte roda logo depois, quando o evento chega à caixa do inventário
document.querySelector('.boxInventario').addEventListener('input', () => atualizarCarga());
forca.addEventListener('input', () => atualizarCarga());
document.addEventListener('fichaCarregada', () => atualizarCarga(true));

calcularEspacoTotal();
calcularPesoTotal();
atualizarCarga(true);
