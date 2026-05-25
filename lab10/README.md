# Lab 10 - Sistema de Gerenciamento de Venda de Carros

## Como rodar o projeto

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar o MongoDB Atlas

Abra o arquivo `server.js` e substitua a linha:
```js
const MONGO_URI = 'mongodb+srv://usuario:COLE_SUA_SENHA_AQUI@cluster0.XXXXX.mongodb.net/lab10?retryWrites=true&w=majority';
```

Cole sua connection string completa do MongoDB Atlas (com a senha gerada automaticamente, aquela com vários caracteres estranhos).

**Como pegar a connection string:**
1. Acesse o MongoDB Atlas
2. Clique em "Connect" no seu Cluster
3. Escolha "Drivers"
4. Copie a string e substitua `<password>` pela sua senha

### 3. Rodar o servidor (precisa de permissão para porta 80)
```bash
# No Linux/Mac:
sudo node server.js

# No Windows (terminal como Administrador):
node server.js
```

### 4. Acessar
Abra o navegador em: `http://localhost`

---

## Estrutura do Projeto
```
lab10/
├── server.js           ← Servidor principal (Express + MongoDB)
├── package.json
├── public/
│   └── css/
│       └── style.css   ← Estilos globais
└── views/
    ├── projects.ejs    ← Página de projetos (com link para Carros)
    ├── usuarios/
    │   ├── cadastro.ejs
    │   └── login.ejs
    └── carros/
        ├── listagem.ejs  ← Listagem pública dos carros
        ├── gerencia.ejs  ← CRUD completo
        └── editar.ejs    ← Form de edição
```

## Rotas
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Redireciona para /projects |
| GET | `/projects` | Página de projetos |
| GET | `/usuarios/cadastro` | Form de cadastro |
| POST | `/usuarios/cadastro` | Cria usuário (CREATE) |
| GET | `/usuarios/login` | Form de login |
| POST | `/usuarios/login` | Autentica usuário (READ) |
| GET | `/carros` | Lista carros disponíveis (READ) |
| GET | `/carros/gerencia` | Página de gerência |
| POST | `/carros/cadastrar` | Cadastra carro (CREATE) |
| GET | `/carros/editar/:id` | Form de edição (READ) |
| POST | `/carros/atualizar/:id` | Atualiza carro (UPDATE) |
| POST | `/carros/remover/:id` | Remove carro (DELETE) |
| POST | `/carros/vender/:id` | Vende carro - decrementa qtde (UPDATE) |

## Coleções do MongoDB

### usuarios
```json
{ "nome": "string", "login": "string", "senha": "string" }
```

### carros
```json
{ "marca": "string", "modelo": "string", "ano": "number", "qtde_disponivel": "number" }
```
