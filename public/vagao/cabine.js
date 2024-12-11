document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    const assentos = document.querySelectorAll('.botaob');
    const numberInput = document.getElementById('number');
    const reservaForm = document.getElementById('reservation-form');
    let dataSelecionada = null;

    // Verificar login
    async function checkLogin() {
        const response = await fetch('/check-login');
        if (!response.ok) {
            alert('Você precisa estar logado para realizar reservas.');
            window.location.href = '../login.html';
        }
    }

    // Carregar assentos ocupados
    async function carregarAssentosOcupados() {
        if (dataSelecionada) {
            const response = await fetch(`/cabine/${dataSelecionada}`);
            if (!response.ok) {
                console.error('Erro ao carregar assentos ocupados:', response.statusText);
                return;
            }
            const reservas = await response.json();
            console.log('Assentos ocupados:', reservas); // Log para verificar os dados retornados

            // Resetar a cor das divs quadrado
            const quadrados = document.querySelectorAll('.quadrado');
            quadrados.forEach(quadrado => {
                quadrado.style.backgroundColor = 'green';
            });

            reservas.forEach(reserva => {
                // Seleciona todos os quadrados com o mesmo data-id
                const quadradosOcupados = document.querySelectorAll(`.quadrado[data-id="${reserva.assento}"]`);
                quadradosOcupados.forEach(quadrado => {
                    quadrado.style.backgroundColor = 'red'; 
                });
                const botao = document.getElementById(reserva.assento);
                if (botao) {
                    botao.classList.add('ocupado');
                } else {
                    console.warn(`Botão não encontrado para o assento: ${reserva.assento}`);
                }
            });
        }
    }

    dateInput.addEventListener('change', () => {
        dataSelecionada = dateInput.value;
        carregarAssentosOcupados();
    });

    // Selecionar um assento
    assentos.forEach(botao => {
        botao.addEventListener('click', () => {
            if (dataSelecionada && !botao.classList.contains('ocupado')) {
                numberInput.value = botao.id; // Aqui você pode manter o ID do botão ou mudar para data-id se necessário
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
        reserva.vagao = 'Cabine';

        const response = await fetch('/cabine/reservar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reserva),
        });

        if (response.ok) {
            alert('Reserva realizada com sucesso!');
            // Recarregar os assentos ocupados para atualizar a cor
            carregarAssentosOcupados();
        } else {
            alert('Erro ao realizar a reserva.');
        }
    });
});