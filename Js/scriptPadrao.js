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

function abrirPericias() {
    const bloco = document.getElementById("blocoPericias");
    if (!bloco) return;
    if (bloco.style.display === "none" || bloco.style.display === "") {
      bloco.style.display = "block";
    } else {
      bloco.style.display = "none";
    }
}

function criarFicha(){
  window.location.href = "ficha.html";
}

function voltar(){
  window.location.replace("home.html");
}

// sair() fica em scriptFirebase.js, pois precisa do Firebase Auth

// MASCARA DE TELEFONE
function mascararTelefone(input) {
    // Remover todos os caracteres que não sejam dígitos
    var digitos = input.value.replace(/\D/g, '');

    // Aplicar a máscara: (XX) XXXXX-XXXX
    if (digitos.length > 0) {
        if (digitos.length <= 2) {
            input.value = '(' + digitos;
        } else if (digitos.length <= 7) {
            input.value = '(' + digitos.substring(0, 2) + ') ' + digitos.substring(2);
        } else if (digitos.length <= 11) {
            input.value = '(' + digitos.substring(0, 2) + ') ' + digitos.substring(2, 7) + '-' + digitos.substring(7);
        } else {
            input.value = '(' + digitos.substring(0, 2) + ') ' + digitos.substring(2, 7) + '-' + digitos.substring(7, 11);
        }
    }
}

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
