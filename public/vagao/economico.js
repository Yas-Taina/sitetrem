document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
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

    // Enviar reserva
    reservaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await checkLogin();

        const formData = new FormData(reservaForm);
        const reserva = Object.fromEntries(formData.entries());
        reserva.data = dateInput.value;  // Aqui garantimos que a data selecionada seja enviada
        reserva.vagao = 'Economico';

        const response = await fetch('/economico/reservar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reserva),
        });

        if (response.ok) {
            alert('Reserva realizada com sucesso!');
            dateInput.dispatchEvent(new Event('change')); // Atualiza a tela
        } else {
            const error = await response.json();
            alert(error.error || 'Erro ao realizar a reserva.');
        }
    });
});

