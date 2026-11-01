// Aplica o tema salvo no navegador antes de a página aparecer (evita piscar o tema padrão).
// Carregado no <head> de todas as páginas, sem "defer". O tema salvo no cadastro do
// jogador é conferido depois pelo scriptTema.js.
(function () {
    try {
        var tema = localStorage.getItem('tema');
        if (tema) document.documentElement.dataset.tema = tema;
    } catch (e) { /* sem localStorage: fica o tema padrão */ }
})();

// Ícone da aba: o d20 (Img/favicon.svg) nas cores do tema. Troca sozinho quando o
// tema muda; sem JavaScript fica o Img/favicon.svg dourado.
(function () {
    // faces do dado: topo, esquerda, direita, base, centro, contorno, número
    var CORES = {
        classico: ['#5ccbf2', '#2a94bd', '#33a5cf', '#1f7699', '#8fe3ff', '#0f2027', '#0f2027'],
        sangue: ['#c00000', '#7a0000', '#8c0000', '#5c0000', '#e02020', '#000000', '#ffffff'],
        morte: ['#3d3d3d', '#1c1c1c', '#242424', '#111111', '#4a4a4a', '#ffffff', '#ffffff'],
        medo: ['#ffffff', '#cfcfcf', '#dadada', '#bdbdbd', '#ffffff', '#000000', '#000000'],
        conhecimento: ['#e0b24a', '#a87a22', '#b8862a', '#8f6519', '#f3cf6a', '#2b1d06', '#2b1d06'],
        energia: ['#a98bff', '#6c4fd1', '#7a5de0', '#5a3fbb', '#c4b0ff', '#16141c', '#16141c']
    };

    function iconeD20(c) {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
            '<g stroke="' + c[5] + '" stroke-width="4" stroke-linejoin="round">' +
            '<polygon points="50,3 91,26 91,74 50,97 9,74 9,26" fill="' + c[3] + '"/>' +
            '<polygon points="50,3 91,26 50,27 9,26" fill="' + c[0] + '"/>' +
            '<polygon points="9,26 50,27 23,71 9,74" fill="' + c[1] + '"/>' +
            '<polygon points="91,26 50,27 77,71 91,74" fill="' + c[2] + '"/>' +
            '<polygon points="9,74 23,71 77,71 91,74 50,97" fill="' + c[3] + '"/>' +
            '<polygon points="50,27 77,71 23,71" fill="' + c[4] + '"/>' +
            '</g><text x="50" y="62" text-anchor="middle" font-family="Georgia, serif" ' +
            'font-size="23" font-weight="700" fill="' + c[6] + '">20</text></svg>';
    }

    function atualizarIcone() {
        var cores = CORES[document.documentElement.dataset.tema] || CORES.classico;
        var href = 'data:image/svg+xml,' + encodeURIComponent(iconeD20(cores));
        var links = document.querySelectorAll('link[rel~="icon"]');
        for (var i = 0; i < links.length; i++) links[i].href = href;
    }

    atualizarIcone();
    new MutationObserver(atualizarIcone)
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-tema'] });
})();
