// auth.js - Simula autenticação e protege rotas

document.addEventListener('DOMContentLoaded', function() {
    const ROTA_LOGIN = 'login.html';
    const ROTA_DASHBOARD_PADRAO = 'index.html';

    const currentPage = window.location.pathname.split('/').pop();

    // Se não estiver logado e não estiver na página de login, redireciona para login
    if (!sessionStorage.getItem('isAdminAuthenticated') && currentPage !== ROTA_LOGIN) {
        window.location.href = ROTA_LOGIN;
        return;
    }

    // Se estiver logado e tentar acessar a página de login, redireciona para o dashboard
    if (sessionStorage.getItem('isAdminAuthenticated') && currentPage === ROTA_LOGIN) {
        window.location.href = ROTA_DASHBOARD_PADRAO;
        return;
    }

    // Lógica de Logout
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('isAdminAuthenticated');
            window.location.href = ROTA_LOGIN;
        });
    }
});

// Função de login é específica para login.js, mas o estado é gerenciado aqui via sessionStorage.
// Função para verificar se está autenticado pode ser chamada por outros scripts se necessário.
function isAdminLoggedIn() {
    return sessionStorage.getItem('isAdminAuthenticated') === 'true';
}
