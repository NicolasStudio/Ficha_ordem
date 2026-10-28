// "i" dentro dos campos de Saúde, Defesas e Resistências, com a explicação de cada um (infoGeral.js)
import infoGeral from "./infoGeral.js";
import { modalInformacao, paragrafo, linhaComRotulo } from "./scriptModal.js";

for (const info of infoGeral) {
    const campo = document.querySelector(`[name="${info.campo}"]`);
    if (!campo) continue;

    // Envolve o campo para o "i" ficar preso à direita dele
    const envoltorio = document.createElement('span');
    envoltorio.className = 'campoComInfo';
    campo.before(envoltorio);
    envoltorio.appendChild(campo);
    campo.classList.add('comInfo');

    const botaoInfo = document.createElement('button');
    botaoInfo.type = 'button';
    botaoInfo.className = 'infoCampo';
    botaoInfo.textContent = 'i';
    botaoInfo.setAttribute('aria-label', `Ver informações de ${info.name}`);
    envoltorio.appendChild(botaoInfo);

    botaoInfo.addEventListener('click', () => {
        const conteudo = document.createElement('div');
        conteudo.append(paragrafo(info.description));
        if (info.formula) conteudo.append(linhaComRotulo('Cálculo.', info.formula));
        modalInformacao(info.name, conteudo);
    });
}
