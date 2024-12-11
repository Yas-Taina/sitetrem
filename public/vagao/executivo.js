document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    const assentos = document.querySelectorAll('.botaoa');
    const numberInput = document.getElementById('number');
    const reservaForm = document.getElementById('reservation-form');
    let dataSelecionada = null;

    // Verificar login
    async function checkLogin() {
        const response = await fetch('/check-login');
        if (!response.ok) {
            alert('Você precisa estar logado para realizar reservas.');
            window.location.href = '/login.html';
        }
    }

    // Carregar assentos ocupados
    dateInput.addEventListener('change', async () => {
        dataSelecionada = dateInput.value;
        if (dataSelecionada) {
            const response = await fetch(`/executivo/${dataSelecionada}`);
            const reservas = await response.json();

            assentos.forEach(botao => {
                botao.style.backgroundColor = 'green';
                botao.classList.remove('ocupado');
            });

            reservas.forEach(reserva => {
                const botao = document.getElementById(reserva.assento);
                if (botao) {
                    botao.style.backgroundColor = 'red';
                    botao.classList.add('ocupado');
                }
            });
        }
    });

    // Selecionar um assento
    assentos.forEach(botao => {
        botao.addEventListener('click', () => {
            if (dataSelecionada && !botao.classList.contains('ocupado')) {
                numberInput.value = botao.id;
            } else if (!dataSelecionada) {
                alert('Escolha uma data primeiro.');
            }
        });
    });

    // Enviar reserva
    reservaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await checkLogin();

        const formData = new FormData(reservaForm);
        const reserva = Object.fromEntries(formData.entries());
        reserva.data = dataSelecionada;
        reserva.vagao = 'Executivo';

        const response = await fetch('/executivo/reservar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reserva),
        });

        if (response.ok) {
            alert('Reserva realizada com sucesso!');
            dateInput.dispatchEvent(new Event('change'));
        } else {
            alert('Erro ao realizar a reserva.');
        }
    });
});
