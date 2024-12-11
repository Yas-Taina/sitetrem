const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Configurações do middleware
app.use(express.static(path.join(__dirname, 'public')));  // Serve arquivos estáticos
app.use(bodyParser.json());  // Configura o body parser para JSON

// Configuração do middleware express-session
app.use(session({
    secret: 'secret-key',  
    resave: false,  // Não reseta a sessão a cada requisição
    saveUninitialized: false,  // Não salva sessões não inicializadas
    cookie: {
        secure: false,  // Se usar HTTPS, defina como true
        httpOnly: true, // Protege contra ataques XSS
        maxAge: 1000 * 60 * 60 // Sessão expira após 1 hora
    }
}));

// Função para garantir que o diretório exista
function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
}

// Caminho para o arquivo de dados
const DATA_FILE = './data.json';

// Função para carregar dados de usuários
function loadUserData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // Se o arquivo não existe, cria o arquivo com dados padrão
            const defaultData = { users: [], lastUserId: 0 };
            fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        // Lê e retorna os dados do arquivo
        const fileData = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(fileData);
    } catch (err) {
        console.error('Erro ao carregar dados dos usuários:', err);
        return { users: [], lastUserId: 0 };
    }
}

// Função para salvar dados de usuários
function saveUserData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Erro ao salvar dados dos usuários:', err);
    }
}

// Carrega os dados de usuários e o último ID de usuário ao iniciar o servidor
let data = loadUserData();
let users = data.users;
let lastUserId = data.lastUserId; // Carrega o último ID utilizado

// Rota de registro de usuário
app.post('/register', async (req, res) => {
    try {
        const { firstName, email, password } = req.body;

        // Verifica se o email já está cadastrado
        if (users.some(user => user.email === email)) {
            return res.status(400).json({ error: 'Usuário já cadastrado.' });
        }

        // Gera um novo ID sequencial para o usuário
        const newUserId = ++lastUserId;

        // Criptografa a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Adiciona o novo usuário ao array de usuários
        users.push({ userId: newUserId, firstName, email, password: hashedPassword });

        // Salva os dados atualizados no arquivo
        saveUserData({ users, lastUserId });

        // Retorna resposta de sucesso
        res.status(201).json({ message: 'Usuário cadastrado com sucesso.', userId: newUserId });
    } catch (err) {
        console.error('Erro no registro do usuário:', err);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// Rota de login de usuário
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Procura o usuário pelo email
        const user = users.find(u => u.email === email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }

        // Armazena o ID do usuário na sessão
        req.session.userId = user.userId;
        req.session.firstName = user.firstName;

        // Retorna resposta de login bem-sucedido
        res.json({ userId: user.userId, firstName: user.firstName, message: 'Login bem-sucedido.' });
    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// Rota para verificar se o usuário está logado
app.get('/check-login', (req, res) => {
    if (req.session.userId) {
        res.status(200).json({ userId: req.session.userId, firstName: req.session.firstName });
    } else {
        res.status(401).json({ error: 'Não autenticado.' });
    }
});

// Rota de logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao destruir a sessão:', err);
            return res.status(500).send('Erro ao realizar logout');
        }
        res.clearCookie('connect.sid'); // Limpa o cookie da sessão
        res.redirect('/login.html'); // Redireciona para a página de login
    });
});



//CONTADOR ID BILHETE

const ID_COUNTER_FILE = './idCounter.json';

// Função para obter o próximo ID
function getNextId() {
    let counterData = JSON.parse(fs.readFileSync(ID_COUNTER_FILE, 'utf-8'));
    counterData.lastId += 1; // Incrementa o ID
    fs.writeFileSync(ID_COUNTER_FILE, JSON.stringify(counterData, null, 2)); // Salva o novo ID
    return counterData.lastId; // Retorna o novo ID
}



//EXECUTIVO
// Rota para buscar assentos ocupados de uma data
app.get('/executivo/:data', (req, res) => {
    const { data } = req.params;
    const filePath = path.join(__dirname, 'executivo', `${data}.json`);

    ensureDirectoryExistence(filePath);

    if (fs.existsSync(filePath)) {
        const reservas = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        res.json(reservas);
    } else {
        fs.writeFileSync(filePath, JSON.stringify([]));
        res.json([]);
    }
});

// Rota para realizar uma reserva
app.post('/executivo/reservar', (req, res) => {
    const { data, assento, nome, cpf, email, vagao } = req.body;
    const filePath = path.join(__dirname, 'executivo', `${data}.json`);

    if (!req.session.userId) {
        return res.status(401).json({ error: 'Você precisa estar logado para realizar uma reserva.' });
    }

    if (!data || !assento || !nome || !cpf || !email) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    let reservas = [];
    if (fs.existsSync(filePath)) {
        reservas = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    if (reservas.some(reserva => reserva.assento === assento)) {
        return res.status(400).json({ error: `O assento ${assento} já está reservado.` });
    }

    const newId = getNextId();
    reservas.push({ id: newId, assento, nome, cpf, email, vagao, userId: req.session.userId });

    fs.writeFileSync(filePath, JSON.stringify(reservas, null, 2));
    res.status(201).json({ message: 'Reserva realizada com sucesso.' });
});


// VAGÃO DE LUXO!!!!!


//Acha registros da data
app.get('/luxo/:data', (req, res) => {
    const { data } = req.params;
    const filePath = path.join(__dirname, 'luxo', `${data}.json`);

    ensureDirectoryExistence(filePath);

    if (fs.existsSync(filePath)) {
        const reservas = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        res.json(reservas);
    } else {
        fs.writeFileSync(filePath, JSON.stringify([]));
        res.json([]);
    }
});

// Rota para realizar uma reserva
app.post('/luxo/reservar', (req, res) => {
    const { data, assento, nome, cpf, email, vagao } = req.body;
    const filePath = path.join(__dirname, 'luxo', `${data}.json`);

    if (!req.session.userId) {
        return res.status(401).json({ error: 'Você precisa estar logado para realizar uma reserva.' });
    }

    if (!data || !assento || !nome || !cpf || !email) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    let reservas = [];
    if (fs.existsSync(filePath)) {
        reservas = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    if (reservas.some(reserva => reserva.assento === assento)) {
        return res.status(400).json({ error: `O assento ${assento} já está reservado.` });
    }

    const newId = getNextId();
    reservas.push({ id: newId, assento, nome, cpf, email, vagao, userId: req.session.userId });

    fs.writeFileSync(filePath, JSON.stringify(reservas, null, 2));
    res.status(201).json({ message: 'Reserva realizada com sucesso.' });
});




// VAGÃO CABINE!!!!!


//Acha registros da data
app.get('/cabine/:data', (req, res) => {
    const { data } = req.params;
    const filePath = path.join(__dirname, 'cabine', `${data}.json`);

    ensureDirectoryExistence(filePath);

    if (fs.existsSync(filePath)) {
        const reservas = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        res.json(reservas);
    } else {
        fs.writeFileSync(filePath, JSON.stringify([]));
        res.json([]);
    }
});

// Rota para realizar uma reserva
app.post('/cabine/reservar', (req, res) => {
    const { data, assento, nome, cpf, email, vagao } = req.body;
    const filePath = path.join(__dirname, 'cabine', `${data}.json`);

    if (!req.session.userId) {
        return res.status(401).json({ error: 'Você precisa estar logado para realizar uma reserva.' });
    }

    if (!data || !assento || !nome || !cpf || !email) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    let reservas = [];
    if (fs.existsSync(filePath)) {
        reservas = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    if (reservas.some(reserva => reserva.assento === assento)) {
        return res.status(400).json({ error: `O assento ${assento} já está reservado.` });
    }

    const newId = getNextId();
    reservas.push({ id: newId, assento, nome, cpf, email, vagao, userId: req.session.userId });

    fs.writeFileSync(filePath, JSON.stringify(reservas, null, 2));
    res.status(201).json({ message: 'Reserva realizada com sucesso.' });
});


function checkReservationLimit(filePath) {
    if (fs.existsSync(filePath)) {
        const reservas = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return reservas.length >= 80;  // Limite de 80 reservas
    }
    return false;  // Se o arquivo não existe, ainda não há reservas
}

// VAGÃO PADRAO!!!!!


app.get('/padrao/:data', (req, res) => {
    const { data } = req.params;
    const filePath = path.join(__dirname, 'padrao', `${data}.json`);

    ensureDirectoryExistence(filePath);

    if (fs.existsSync(filePath)) {
        const reservas = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        res.json(reservas);
    } else {
        // Se o arquivo não existir, cria um arquivo vazio para a data
        fs.writeFileSync(filePath, JSON.stringify([]));
        res.json([]);  // Retorna um array vazio
    }
});

// Rota para realizar uma reserva
app.post('/padrao/reservar', (req, res) => {
    const { data, nome, cpf, email, vagao } = req.body;
    const filePath = path.join(__dirname, 'padrao', `${data}.json`);

    // Verificar se o usuário está logado
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Você precisa estar logado para realizar uma reserva.' });
    }

    // Verificar se todos os campos obrigatórios foram preenchidos
    if (!data || !nome || !cpf || !email) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    // Verificar o limite de reservas para a data
    if (checkReservationLimit(filePath)) {
        return res.status(400).json({ error: 'Limite de 80 reservas atingido para essa data.' });
    }

    let reservas = [];
    if (fs.existsSync(filePath)) {
        reservas = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    // Adicionar a nova reserva
    const newId = getNextId();
    reservas.push({ id: newId, nome, cpf, email, vagao, userId: req.session.userId });

    // Garantir que o diretório existe
    ensureDirectoryExistence(filePath);

    // Salvar as reservas no arquivo JSON
    fs.writeFileSync(filePath, JSON.stringify(reservas, null, 2));

    res.status(201).json({ message: 'Reserva realizada com sucesso.' });
});


// VAGÃO ECONOMICO!!!!!


app.get('/economico/:data', (req, res) => {
    const { data } = req.params;
    const filePath = path.join(__dirname, 'economico', `${data}.json`);

    ensureDirectoryExistence(filePath);

    if (fs.existsSync(filePath)) {
        const reservas = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        res.json(reservas);
    } else {
        fs.writeFileSync(filePath, JSON.stringify([]));
        res.json([]);
    }
});

// Rota para realizar uma reserva
app.post('/economico/reservar', (req, res) => {
    const { data, nome, cpf, email, vagao } = req.body;
    const filePath = path.join(__dirname, 'economico', `${data}.json`);

    // Verificar se o usuário está logado
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Você precisa estar logado para realizar uma reserva.' });
    }

    // Verificar se todos os campos estão preenchidos
    if (!data || !nome || !cpf || !email) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    // Verificar o limite de reservas para a data
    if (checkReservationLimit(filePath)) {
        return res.status(400).json({ error: 'Limite de 80 reservas atingido para essa data.' });
    }

    let reservas = [];
    if (fs.existsSync(filePath)) {
        reservas = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    // Verificar se o assento já está reservado
    if (reservas.some(reserva => reserva.email === email)) {
        return res.status(400).json({ error: `O usuário ${email} já tem uma reserva para essa data.` });
    }

    // Adicionar a nova reserva
    const newId = getNextId();
    reservas.push({ id: newId, nome, cpf, email, vagao, userId: req.session.userId });

    // Garantir que o diretório existe
    ensureDirectoryExistence(filePath);

    // Salvar as reservas no arquivo JSON
    fs.writeFileSync(filePath, JSON.stringify(reservas, null, 2));

    res.status(201).json({ message: 'Reserva realizada com sucesso.' });
});


//logica encontrar e editar

// Rota para obter registros filtrados pelo userId
app.get('/bilhete', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const userId = req.session.userId;
    const pastas = ['economico', 'padrao', 'executivo', 'luxo', 'cabine'];
    const registros = [];

    pastas.forEach((pasta) => {
        const dirPath = path.join(__dirname, pasta);
        fs.readdirSync(dirPath).forEach((file) => {
            const filePath = path.join(dirPath, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const registrosUsuario = data.filter((registro) => registro.userId === userId);
            registros.push(...registrosUsuario);
        });
    });

    res.json(registros);
});

// Rota para deletar um registro
app.delete('/bilhete/:id', (req, res) => {
    const { id } = req.params;
    const pastas = ['economico', 'padrao', 'executivo', 'luxo', 'cabine'];

    let registroDeletado = false;
    pastas.forEach((pasta) => {
        const dirPath = path.join(__dirname, pasta);
        fs.readdirSync(dirPath).forEach((file) => {
            const filePath = path.join(dirPath, file);
            let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const index = data.findIndex((registro) => registro.id === parseInt(id));
            if (index !== -1) {
                data.splice(index, 1); // Remove o registro
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                registroDeletado = true;
            }
        });
    });

    if (registroDeletado) {
        res.status(200).json({ message: 'Registro deletado com sucesso.' });
    } else {
        res.status(404).json({ error: 'Registro não encontrado.' });
    }
});

// Rota para editar um registro
app.put('/bilhete/:id', (req, res) => {
    const { id } = req.params;
    const { nome, cpf, email } = req.body;
    const pastas = ['economico', 'padrao', 'executivo', 'luxo', 'cabine'];

    let registroEditado = false;
    pastas.forEach((pasta) => {
        const dirPath = path.join(__dirname, pasta);
        fs.readdirSync(dirPath).forEach((file) => {
            const filePath = path.join(dirPath, file);
            let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const index = data.findIndex((registro) => registro.id === parseInt(id));
            if (index !== -1) {
                const registro = data[index];
                if (registro.userId === req.session.userId) {  // Verifica se o registro pertence ao usuário logado
                    registro.nome = nome || registro.nome;
                    registro.cpf = cpf || registro.cpf;
                    registro.email = email || registro.email;
                    data[index] = registro;
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                    registroEditado = true;
                }
            }
        });
    });

    if (registroEditado) {
        res.status(200).json({ message: 'Registro editado com sucesso.' });
    } else {
        res.status(404).json({ error: 'Registro não encontrado ou você não tem permissão para editá-lo.' });
    }
});



// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
