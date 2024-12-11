// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Ação de cadastro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const firstName = document.getElementById('first-name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Validação simples do formulário
            if (!firstName || !email || !password || !confirmPassword) {
                alert("Todos os campos são obrigatórios!");
                return;
            }

            // Verifica se as senhas são iguais
            if (password !== confirmPassword) {
                alert('Senhas diferentes!');
                return;
            }

            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Usuário cadastrado com sucesso!');
                window.location.href = '/login.html'; // Redireciona para a página de login
            } else {
                alert(data.error);
            }
        });
    }
    // Ação de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            // Validação simples do formulário
            if (!email || !password) {
                alert("Email e senha são obrigatórios!");
                return;
            }

            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Login bem-sucedido!');
                window.location.href = '/index.html'; // Redireciona para a página principal após login
            } else {
                alert(data.error);
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {

    /** Verificar estado de login e alternar divs **/
    const checkLoginState = async () => {
        try {
            const response = await fetch('/check-login', { credentials: 'include' });

            if (response.ok) {
                console.log('Usuário está logado');
                toggleDivs('user-nav', 'app');
            } else {
                console.log('Usuário não está logado');
                toggleDivs('app', 'user-nav');
            }
        } catch (err) {
            console.error('Erro ao verificar estado de login:', err);
            toggleDivs('app', 'user-nav'); // Assume que o usuário está deslogado
        }
    };

    checkLoginState();

    /** Função para alternar a exibição de divs **/
    function toggleDivs(showDivId, hideDivId) {
        const showDiv = document.getElementById(showDivId);
        const hideDiv = document.getElementById(hideDivId);

        if (showDiv) {
            showDiv.style.display = 'block'; // Mostra a div
        } else {
            console.error(`Div com ID "${showDivId}" não encontrada.`);
        }

        if (hideDiv) {
            hideDiv.style.display = 'none'; // Oculta a outra div
        } else {
            console.error(`Div com ID "${hideDivId}" não encontrada.`);
        }
    }

});
