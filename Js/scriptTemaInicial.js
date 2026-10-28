// Aplica o tema salvo no navegador antes de a página aparecer (evita piscar o tema padrão).
// Carregado no <head> de todas as páginas, sem "defer". O tema salvo no cadastro do
// jogador é conferido depois pelo scriptTema.js.
(function () {
    try {
        var tema = localStorage.getItem('tema');
        if (tema) document.documentElement.dataset.tema = tema;
    } catch (e) { /* sem localStorage: fica o tema padrão */ }
})();
