
function insertHeader() {
	const headerHTML = `
		<div class = "login-box">
			<nav id="user-nav" style="display: none;">
            			<button id="logout-button">Logout</button>
            			<span id="user-greeting">Bem Vindo!</span>
        		</nav>
			<div id="app" style="display: block;">
            			<button onclick="location.href='../login.html'">Login</button>
            			<button onclick="location.href='../register.html'">Cadastro</button>
        		</div>
		</div>
		<div class="mainheader">
			<img src="../img/mainlogo.png" alf="Logo do Expresso Sul-Americano" id="logohead">
			<img src="../img/menu-icon.png" alt="Menu" class="menu-icon" id="menu-icon">
        	</div>
        	<nav class="nav" id="nav">
            		<ul class="menu">
                		<li><a href="../index.html">Inicio</a></li>
				<li><a href="../vagao.html">Vagões e Reserva</a></li>
				<li><a href="../passeio.html">O Passeio</a></li>
				<li><a href="../blog.html">Blog do Trem</a></li>
				<li><a href="../bilhetes.html">Meus Bilhetes</a></li>
			</ul>
        	</nav>
	`;
	document.getElementById('headerhere').innerHTML = headerHTML;
}

function insertFooter() {
	const footerHTML = `
		<div class="mainlogo">
			<img src="../img/mainlogo.png" alt="Logo do Expresso Sul-Americano" id="logofooter">
		</div>
		<div class="container" id="containerboxendere">
			<div id="box">
				<h4>Fale conosco</h4>
				    <form id="validationForm">
        				<label for="name">Nome:</label>
        				<input type="text" id="namees" name="name" required>

        				<label for="document">Documento:</label>
        				<input type="text" id="documentes" name="document" required>

        				<label for="message">Mensagem:</label>
        				<textarea id="messagees" name="message" rows="4" required></textarea>

        				<button type="submit" id="botaoes">Enviar</button>
    				</form>
			</div>
			<div class="box" id="endereco">
				<h4>Endereço: Rua das Flores, nº 000</h4>
				<h4>Horario de Atendimento</h4>
				<ul>
					<li>Segunda a Sexta: 7h às 18h</li>
					<li>Sábados: 9h às 17h30</li>
					<li>Domingos e Feriados: 9h às 14h30</li>
					<li>*Os horários podem sofrer alterações</li>
				</ul>
			</div>
		</div>
		<div id="footlink">
			<a>FAQ</a>
			<a>Contato</a>
			<a>Guia</a>
		</div>
		<div id="foot"> 
			<p>O conteúdo deste site é puramente fictício para o propósito do trabalho final da matéria de Desenvolvimento WEB I</p>
			<p> Desenvolvido por Yasmin Tainá da Silva e João Alberto François</p>
			<p> © Expresso Sul-Americano, 2024 </p>
		</div>
	`;
 	document.getElementById('footerhere').innerHTML = footerHTML;
	setupMenu();
	logout();
	easter()
}

window.addEventListener('DOMContentLoaded', () => {
	insertHeader();
	insertFooter();
});

function setupMenu(){
	const menuIcon = document.getElementById('menu-icon');
	const nav = document.getElementById('nav');
	const header = document.querySelector('header');

	menuIcon.addEventListener('click', () => {
		nav.classList.toggle('active');
	});

}

function logout(){
const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', async () => {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Falha ao realizar o logout');
        }

        // Adicionar um delay curto para garantir que a sessão seja destruída antes do redirecionamento
        await new Promise(resolve => setTimeout(resolve, 500));

        window.location.href = '../login.html';
    } catch (error) {
        console.error('Erro ao realizar logout:', error);
        alert('Ocorreu um erro ao realizar o logout. Tente novamente. Detalhes:', error.message);
    }
});
}

function easter(){
        document.getElementById('validationForm').addEventListener('submit', function(event) {
            event.preventDefault();

            const name = document.getElementById('namees').value;
            const documentValue = document.getElementById('documentes').value;
            const message = document.getElementById('messagees').value;

            // Verificar valores específicos
            if (name === 'Elizabeth Sarre' && documentValue === '95573622' && message === 'id: 1337, assento: 12') {
                window.location.href = '../info/vagao.html'; 
            } else {
                alert('Obrigada pelo contato, responderemos quando sentirmos vontade'); // Mostrar alerta
            }
        });
}




