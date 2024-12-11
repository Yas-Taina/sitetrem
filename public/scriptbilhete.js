window.onload = async () => {
    const response = await fetch('/bilhete');
    const bilhetes = await response.json();

    const bilhetesContainer = document.getElementById('bilhetes-container');
    bilhetes.forEach((bilhete) => {
        const div = document.createElement('div');
        div.classList.add('bilhete');
        div.innerHTML = `
            <p><strong>Nome:</strong> <span id="nome-${bilhete.id}">${bilhete.nome}</span></p>
            <p><strong>Documento:</strong> <span id="cpf-${bilhete.id}">${bilhete.cpf}</span></p>
            <p><strong>Email:</strong> <span id="email-${bilhete.id}">${bilhete.email}</span></p>
            <p><strong>Assento:</strong> ${bilhete.assento || 'N/A'}</p>
            <p><strong>Vagão:</strong> ${bilhete.vagao || 'N/A'}</p>
            <button onclick="editarBilhete(${bilhete.id})">Editar</button>
            <button onclick="deletarBilhete(${bilhete.id})">Deletar</button>
        `;
        bilhetesContainer.appendChild(div);
    });
};

async function editarBilhete(id) {
    const nome = prompt('Novo nome:');
    const cpf = prompt('Novo CPF:');
    const email = prompt('Novo email:');

    const response = await fetch(`/bilhete/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, cpf, email }),
    });

    const data = await response.json();
    alert(data.message || data.error);
    if (response.ok) {
        window.location.reload();
    }
}

async function deletarBilhete(id) {
    if (confirm('Tem certeza que deseja deletar esse registro?')) {
        const response = await fetch(`/bilhete/${id}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        alert(data.message || data.error);
        if (response.ok) {
            window.location.reload();
        }
    }
}
