const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

// =============================================
// CONFIGURAÇÃO DO MONGODB
// Use a sua connection string completa do Atlas aqui
// Copie direto do MongoDB Atlas > Connect > Drivers
// Exemplo: mongodb+srv://usuario:<SUA_SENHA_AQUI>@cluster0.xxxxx.mongodb.net/
// =============================================
const MONGO_URI = 'mongodb+srv://anasalles:Rxj1hplHF0vO7mOy@cluster0.pat4zgo.mongodb.net/lab10?retryWrites=true&w=majority&ssl=true';
const DB_NAME = 'lab10';

let db;

// Conectar ao MongoDB
MongoClient.connect(MONGO_URI)
  .then(client => {
    db = client.db(DB_NAME);
    console.log('✅ Conectado ao MongoDB com sucesso!');
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    console.error('👉 Verifique se substituiu a MONGO_URI pela sua connection string do Atlas!');
  });

// Middlewares
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// =============================================
// ROTAS PRINCIPAIS
// =============================================

// '/' redireciona para Projects
app.get('/', (req, res) => {
  res.redirect('/projects');
});

// Página de Projects (tabela com link para Carros)
app.get('/projects', (req, res) => {
  res.render('projects');
});

// =============================================
// ROTAS DE USUÁRIOS
// =============================================

// Cadastro de usuário - GET
app.get('/usuarios/cadastro', (req, res) => {
  res.render('usuarios/cadastro', { erro: null, sucesso: null });
});

// Cadastro de usuário - POST (CREATE)
app.post('/usuarios/cadastro', async (req, res) => {
  try {
    const { nome, login, senha } = req.body;
    if (!nome || !login || !senha) {
      return res.render('usuarios/cadastro', { erro: 'Preencha todos os campos!', sucesso: null });
    }
    const existente = await db.collection('usuarios').findOne({ login });
    if (existente) {
      return res.render('usuarios/cadastro', { erro: 'Login já está em uso!', sucesso: null });
    }
    await db.collection('usuarios').insertOne({ nome, login, senha });
    res.render('usuarios/cadastro', { erro: null, sucesso: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    res.render('usuarios/cadastro', { erro: 'Erro interno: ' + err.message, sucesso: null });
  }
});

// Login de usuário - GET
app.get('/usuarios/login', (req, res) => {
  res.render('usuarios/login', { erro: null });
});

// Login de usuário - POST (READ)
app.post('/usuarios/login', async (req, res) => {
  try {
    const { login, senha } = req.body;
    const usuario = await db.collection('usuarios').findOne({ login, senha });
    if (!usuario) {
      return res.render('usuarios/login', { erro: 'Login ou senha incorretos!' });
    }
    res.redirect('/carros');
  } catch (err) {
    res.render('usuarios/login', { erro: 'Erro interno: ' + err.message });
  }
});

// =============================================
// ROTAS DE CARROS
// =============================================

// Listagem dos carros disponíveis (READ)
app.get('/carros', async (req, res) => {
  try {
    const carros = await db.collection('carros').find({}).toArray();
    res.render('carros/listagem', { carros });
  } catch (err) {
    res.render('carros/listagem', { carros: [], erro: err.message });
  }
});

// Gerência dos carros (lista com ações)
app.get('/carros/gerencia', async (req, res) => {
  try {
    const carros = await db.collection('carros').find({}).toArray();
    res.render('carros/gerencia', { carros, sucesso: null, erro: null });
  } catch (err) {
    res.render('carros/gerencia', { carros: [], sucesso: null, erro: err.message });
  }
});

// Cadastrar novo carro (CREATE)
app.post('/carros/cadastrar', async (req, res) => {
  try {
    const { marca, modelo, ano, qtde_disponivel } = req.body;
    await db.collection('carros').insertOne({
      marca,
      modelo,
      ano: parseInt(ano),
      qtde_disponivel: parseInt(qtde_disponivel)
    });
    res.redirect('/carros/gerencia?sucesso=Carro cadastrado com sucesso!');
  } catch (err) {
    res.redirect('/carros/gerencia?erro=' + err.message);
  }
});

// Remover carro (DELETE)
app.post('/carros/remover/:id', async (req, res) => {
  try {
    await db.collection('carros').deleteOne({ _id: new ObjectId(req.params.id) });
    res.redirect('/carros/gerencia?sucesso=Carro removido com sucesso!');
  } catch (err) {
    res.redirect('/carros/gerencia?erro=' + err.message);
  }
});

// Página de edição de carro (READ para preencher form)
app.get('/carros/editar/:id', async (req, res) => {
  try {
    const carro = await db.collection('carros').findOne({ _id: new ObjectId(req.params.id) });
    res.render('carros/editar', { carro, erro: null });
  } catch (err) {
    res.redirect('/carros/gerencia?erro=' + err.message);
  }
});

// Atualizar carro (UPDATE)
app.post('/carros/atualizar/:id', async (req, res) => {
  try {
    const { marca, modelo, ano, qtde_disponivel } = req.body;
    await db.collection('carros').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { marca, modelo, ano: parseInt(ano), qtde_disponivel: parseInt(qtde_disponivel) } }
    );
    res.redirect('/carros/gerencia?sucesso=Carro atualizado com sucesso!');
  } catch (err) {
    res.redirect('/carros/gerencia?erro=' + err.message);
  }
});

// Vender carro - decrementa quantidade (UPDATE)
app.post('/carros/vender/:id', async (req, res) => {
  try {
    const carro = await db.collection('carros').findOne({ _id: new ObjectId(req.params.id) });
    if (!carro) {
      return res.redirect('/carros/gerencia?erro=Carro não encontrado!');
    }
    if (carro.qtde_disponivel <= 0) {
      return res.redirect('/carros/gerencia?erro=Carro já está esgotado!');
    }
    await db.collection('carros').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { qtde_disponivel: -1 } }
    );
    res.redirect('/carros/gerencia?sucesso=Venda realizada com sucesso!');
  } catch (err) {
    res.redirect('/carros/gerencia?erro=' + err.message);
  }
});

// =============================================
// INICIAR SERVIDOR NA PORTA 80
// =============================================
const PORT = 80;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`👉 Acesse: http://localhost`);
});
