// login.js - Lógica para a página de login

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    // Se já estiver autenticado, redireciona para o dashboard.
    // A lógica principal de redirecionamento está em auth.js, mas uma verificação dupla não faz mal.
    if (sessionStorage.getItem('isAdminAuthenticated') === 'true') {
        window.location.href = 'index.html'; // Página principal do dashboard
        return;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Simulação de credenciais
            const ADMIN_USER = 'admin';
            const ADMIN_PASS = 'admin';

            if (username === ADMIN_USER && password === ADMIN_PASS) {
                sessionStorage.setItem('isAdminAuthenticated', 'true');
                window.location.href = 'index.html'; // Redireciona para o dashboard
            } else {
                loginMessage.textContent = 'Usuário ou senha inválidos.';
                loginMessage.style.display = 'block';
            }
        });
    }
});
