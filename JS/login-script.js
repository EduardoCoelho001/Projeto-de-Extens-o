// login-script.js

// Importe a instância 'auth' que foi exportada de firebase-config.js
import { auth } from './firebase-config.js';
// Importe a função de login específica do SDK do Firebase Authentication
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js"; // Importe também do CDN

// Referências aos elementos do formulário
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageDisplay = document.getElementById('message');

// Listener para o evento de submit do formulário
if (loginForm) { // Verifica se o formulário existe antes de adicionar o listener
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página

    const email = emailInput.value;
    const password = passwordInput.value;

    messageDisplay.textContent = 'Entrando...';
    messageDisplay.style.color = 'gray';

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Login bem-sucedido
      const user = userCredential.user;
      messageDisplay.textContent = `Bem-vindo, ${user.email}! Redirecionando...`;
      messageDisplay.style.color = 'green';
      // Redireciona o usuário para outra página aqui após o login
      window.location.href = 'admin.html';
      console.log('Usuário logado:', user);
    } catch (error) {
      // Ocorreu um erro durante o login
      let friendlyErrorMessage = 'Erro ao fazer login. Verifique seu e-mail e senha.';

      // Mensagens de erro mais amigáveis para alguns códigos comuns do Firebase
      switch (error.code) {
        case 'auth/user-not-found':
          friendlyErrorMessage = 'Nenhum usuário encontrado com este e-mail.';
          break;
        case 'auth/wrong-password':
          friendlyErrorMessage = 'Senha incorreta.';
          break;
        case 'auth/invalid-email':
          friendlyErrorMessage = 'Formato de e-mail inválido.';
          break;
        case 'auth/too-many-requests':
          friendlyErrorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
          break;
        case 'auth/network-request-failed':
          friendlyErrorMessage = 'Problema de conexão com a internet. Verifique sua rede.';
          break;
        default:
          console.error("Erro no login:", error.message);
          break;
      }
      messageDisplay.textContent = friendlyErrorMessage;
      messageDisplay.style.color = 'red';
    }
  });
}

// Opcional: Monitorar o estado de autenticação (útil para manter a UI atualizada)
// Isso também precisa da instância 'auth'
if (auth) { // Verifica se 'auth' está disponível
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('Usuário está logado:', user.email);
      // Ex: Atualizar algum elemento na página se o usuário já estiver logado
    } else {
      console.log('Nenhum usuário logado.');
    }
  });
}
