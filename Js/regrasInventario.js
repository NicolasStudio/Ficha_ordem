// Regras do inventário usadas pela ficha (scriptInventario.js, scriptRecebimentos.js)
// e pelo envio de itens do mestre (scriptEnviar.js)

export const LINHAS_INVENTARIO = 8;

// Capacidade = 10 + 5 × FOR (FOR negativa reduz 5 por ponto; vazia conta como 0)
export const capacidadeDeCarga = forca => 10 + 5 * (parseInt(forca, 10) || 0);

// Os valores vêm no formato "1,50"
export const numero = texto => parseFloat(String(texto || '0').replace(',', '.')) || 0;

// Uma linha está ocupada se qualquer coluna (Item, Detalhes, Espaço, Peso) estiver preenchida.
// valor(nome) devolve o conteúdo do campo: da ficha salva ou dos campos da tela.
export function linhaOcupada(valor, linha) {
    return ['item', 'info', 'espaco', 'peso'].some(coluna => String(valor(coluna + linha) ?? '').trim() !== '');
}
