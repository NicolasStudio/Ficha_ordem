function irCadastro() {
    // Oculta a tela de login e exibe a tela de cadastro
    document.querySelector('.boxLogin').style.display = 'none';
    document.querySelector('.boxCadastro').style.display = 'block';
}

function irLogin() {
    // Oculta a tela de cadastro e exibe a tela de login
    document.querySelector('.boxCadastro').style.display = 'none';
    document.querySelector('.boxLogin').style.display = 'block';
}

function irLogin2() {
    window.location.replace("index.html");
}

function criarFicha(){
  window.location.href = "ficha.html";
}

function voltar(){
  window.location.replace("home.html");
}

// sair() fica em scriptFirebase.js, pois precisa do Firebase Auth

// Mostra uma mensagem de erro por 2 segundos
function mostrarErro(seletor, mensagem) {
    const erro = document.querySelector(seletor);
    if (mensagem) {
        erro.querySelector('span').textContent = mensagem;
    }
    erro.style.display = 'block';

    // Reinicia o tempo se o erro aparecer de novo antes de sumir
    clearTimeout(erro.timer);
    erro.timer = setTimeout(() => {
        erro.style.display = 'none';
    }, 2000);
}

// Validar senha
function validarSenha() {
  const senha1 = document.getElementById("senhaRec").value;
  const senha2 = document.getElementById("senhaRec2").value;

  if (senha1 !== senha2) {
      mostrarErro('.erroSenha');
      return false;
  }
  return true;
}
