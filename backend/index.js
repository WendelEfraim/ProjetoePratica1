const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const pool = require('./db/conn')

app.use(express.json())

app.post('/user/register', async (req, res) => {
    const { nome, sobreNome, phone, email, senha } = req.body;

    if(!nome){
        res.status(422)
        .json({
            message:"Por favor insira um nome"
        })
        return
    }

    if(!sobreNome){
        res.status(422)
        .json({
            message:"Por favor insira um sobre nome"
        })
        return
    }
    
    if(!phone){
        res.status(422)
        .json({
            message:"Por favor insira um telefone"
        })
        return
    }

    if(!email){
        res.status(422)
        .json({
            message:"Por favor insira um email"
        })
        return
    }

    if(!senha){
        res.status(422)
        .json({
            message:"Por favor insira uma senha"
        })
        return
    }

    try {
        // Verificar se o email já existe
        const checkEmailSql = "SELECT email FROM users WHERE email = ? LIMIT 1";
        pool.query(checkEmailSql, [email], async (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Erro ao consultar o banco de dados",
                    error: err
                });
            }

            if (results.length > 0) {
                // Email já registrado
                return res.status(409).json({
                    message: "Email já registrado"
                });
            }

            // Hash da senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(senha, salt);

            // Inserir novo usuário
            const insertUserSql = "INSERT INTO users (nome, sobrenome, phone, email, senha) VALUES (?, ?, ?, ?, ?)";
            const dados = [nome, sobreNome, phone, email, hashedPassword];

            pool.query(insertUserSql, dados, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        message: "Erro ao registrar usuário",
                        error: err
                    });
                }
                res.status(201).json({
                    message: "Registrado com sucesso!"
                });
            });
        });
    } catch (err) {
        res.status(500).json({
            message: "Erro ao processar a senha",
            error: err
        });
    }
});

app.post('/user/login', (req, res) => {
    const { email, senha } = req.body;

    // Validação dos campos obrigatórios
    if (!email || !senha) {
        return res.status(422).json({
            message: "Email e senha são obrigatórios"
        });
    }

    const sql = "SELECT senha FROM users WHERE email = ? LIMIT 1";
    const dados = [email];

    pool.query(sql, dados, (error, results) => {
        if (error) {
            return res.status(500).json({
                message: "Erro ao consultar o banco de dados",
                error
            });
        }

        if (results.length > 0) {
            const user = results[0];

            bcrypt.compare(senha, user.senha, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: "Erro ao comparar senhas",
                        error: err
                    });
                }
                if (result) {
                    return res.status(200).json({
                        message: "Login bem-sucedido"
                    });
                } else {
                    return res.status(401).json({
                        message: "Senha incorreta"
                    });
                }
            });
        } else {
            return res.status(404).json({
                message: "Usuário não encontrado"
            });
        }
    });
});

app.put('/user/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, sobreNome, phone, email, senha } = req.body;

    if (!id || !nome || !sobreNome || !phone || !email || !senha) {
        return res.status(422).json({
            message: "Todos os campos são obrigatórios"
        });
    }

    try {
        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        // Atualizar usuário
        const sql = "UPDATE users SET nome = ?, sobrenome = ?, phone = ?, email = ?, senha = ? WHERE id_user = ?";
        const dados = [nome, sobreNome, phone, email, hashedPassword, id];

        pool.query(sql, dados, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Erro ao atualizar usuário",
                    error: err
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Usuário não encontrado"
                });
            }

            res.status(200).json({
                message: "Usuário atualizado com sucesso"
            });
        });
    } catch (err) {
        res.status(500).json({
            message: "Erro ao processar a senha",
            error: err
        });
    }
});

// Rota para deletar um usuário pelo ID

app.delete('/user/:id', (req, res) => {

    // Obtém o ID do usuário a partir dos parâmetros da URL
    const { id } = req.params;

    // Verifica se o ID foi fornecido na solicitação
    if (!id) {
        return res.status(422).json({
            message: "O ID do usuário é obrigatório"
        });
    }

    // SQL para deletar o usuário com o ID especificado
    const sql = "DELETE FROM users WHERE id_user = ?";
    const dados = [id];

    // Executa a consulta SQL para deletar o usuário
    pool.query(sql, dados, (err, result) => {
        
        // Se ocorrer um erro durante a execução da consulta, retorna um erro 500
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Erro ao deletar o usuário",
                error: err
            });
        }

        // Se nenhum usuário foi afetado pela consulta (não encontrado), retorna um erro 404
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado"
            });
        }

        // Se a exclusão for bem-sucedida, retorna uma mensagem de sucesso com status 200
        res.status(200).json({
            message: "Usuário deletado com sucesso"
        });
    });
});


//           PRODUTOS!!


// Rota para obter a lista de produtos
app.get('/', (req, res) => {

    // Consulta SQL para obter todos os produtos
    const sql = `
        SELECT 
            p.id_produto, 
            p.titulo, 
            p.descricao, 
            p.preco, 
            c.nome AS categoria, 
            u.nome AS vendedor 
        FROM produto p
        LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
        LEFT JOIN users u ON p.id_user = u.id_user
    `;

    pool.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Erro ao consultar o banco de dados",
                error: err
            });
        }

        res.status(200).json(results);
    });
});

// CADASTRAR PRODUTO

app.post('/produtos/cadastrar', (req, res) => {
    const { titulo, descricao, preco, id_user, id_categoria } = req.body;

    // Validação dos campos obrigatórios
    if (!titulo || !preco || !id_user || !id_categoria) {
        return res.status(422).json({
            message: "Título, preço, ID do usuário e ID da categoria são obrigatórios"
        });
    }

    // Consulta SQL para inserir um novo produto
    const sql = `
        INSERT INTO produto (titulo, descricao, preco, id_user, id_categoria)
        VALUES (?, ?, ?, ?, ?)
    `;

    const dados = [titulo, descricao, preco, id_user, id_categoria];

    pool.query(sql, dados, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Erro ao cadastrar o produto",
                error: err
            });
        }

        res.status(201).json({
            message: "Produto cadastrado com sucesso!",
            produtoId: result.insertId
        });
    });
});

//CADASTRAR PRODUTO

app.post('/produtos/cadastrar', (req, res) => {
    const { titulo, descricao, preco, id_user, id_categoria } = req.body;

    // Validação dos campos obrigatórios
    if (!titulo || !preco || !id_user || !id_categoria) {
        return res.status(422).json({
            message: "Título, preço, ID do usuário e ID da categoria são obrigatórios"
        });
    }

    // Consulta SQL para inserir um novo produto
    const sql = `
        INSERT INTO produto (titulo, descricao, preco, id_user, id_categoria)
        VALUES (?, ?, ?, ?, ?)
    `;

    // Dados para a consulta
    const dados = [titulo, descricao, preco, id_user, id_categoria];

    // Executar a consulta
    pool.query(sql, dados, (err, result) => {
        if (err) {
            console.error("Erro ao cadastrar o produto:", err);
            return res.status(500).json({
                message: "Erro ao cadastrar o produto",
                error: err
            });
        }

        // Responder com sucesso e o ID do produto criado
        res.status(201).json({
            message: "Produto cadastrado com sucesso!",
            produtoId: result.insertId
        });
    });
});


app.listen('5000')

