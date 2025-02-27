const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

// Configuração da conexão com o banco de dados PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "der_api_rest",
  password: "postgres",
  port: 5432,
});

const app = express();
app.use(bodyParser.json()); // Middleware para tratar JSON

// --- CRUD para a tabela "Aluno" ---

// CREATE - Inserir novo aluno
app.post("/alunos", async (req, res) => {
  const { tx_nome, tx_sexo, dt_nascimento } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO aluno (tx_nome, tx_sexo, dt_nascimento) VALUES ($1, $2, $3) RETURNING *",
      [tx_nome, tx_sexo, dt_nascimento]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - Buscar todos os alunos
app.get("/alunos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM aluno");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - Buscar um aluno por ID
app.get("/alunos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM aluno WHERE id_aluno = $1", [
      id,
    ]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Aluno não encontrado" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Atualizar um aluno por ID
app.put("/alunos/:id", async (req, res) => {
  const { id } = req.params;
  const { tx_nome, tx_sexo, dt_nascimento } = req.body;
  try {
    const result = await pool.query(
      "UPDATE aluno SET tx_nome = $1, tx_sexo = $2, dt_nascimento = $3 WHERE id_aluno = $4 RETURNING *",
      [tx_nome, tx_sexo, dt_nascimento, id]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Aluno não encontrado" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Excluir um aluno por ID
app.delete("/alunos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM aluno WHERE id_aluno = $1 RETURNING *",
      [id]
    );
    if (result.rows.length > 0) {
      res.status(200).json({ message: "Aluno excluído com sucesso" });
    } else {
      res.status(404).json({ message: "Aluno não encontrado" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para listar todos os cursos
// No arquivo do backend
app.get("/cursos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM curso");
    console.log("Dados retornados do banco:", result.rows); // Log para depuração
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar cursos:", err.message);
    res.status(500).send("Erro ao buscar cursos.");
  }
});

// Rota para buscar um curso por ID
app.get("/cursos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM curso WHERE id_curso = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).send("Curso não encontrado.");
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao buscar o curso.");
  }
});

// Rota para inserir um novo curso
app.post("/cursos", async (req, res) => {
  const { id_instituicao, id_tipo_curso, tx_descricao } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO curso (id_instituicao, id_tipo_curso, tx_descricao) VALUES ($1, $2, $3) RETURNING *",
      [id_instituicao, id_tipo_curso, tx_descricao]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao criar o curso.");
  }
});

// Rota para atualizar um curso existente
app.put("/cursos/:id", async (req, res) => {
  const { id } = req.params;
  const { id_instituicao, id_tipo_curso, tx_descricao } = req.body;
  try {
    const result = await pool.query(
      "UPDATE curso SET id_instituicao = $1, id_tipo_curso = $2, tx_descricao = $3 WHERE id_curso = $4 RETURNING *",
      [id_instituicao, id_tipo_curso, tx_descricao, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Curso não encontrado.");
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao atualizar o curso.");
  }
});

// Rota para deletar um curso
app.delete("/cursos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM curso WHERE id_curso = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Curso não encontrado.");
    }
    res.status(200).send("Curso deletado com sucesso.");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao deletar o curso.");
  }
});

// Rota para listar todos os professores (atualizada)
// Rota GET completa para professores
app.get("/professores", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id_professor,
        p.tx_nome,
        p.tx_sexo,
        p.tx_estado_civil,
        p.dt_nascimento,
        p.tx_telefone,
        p.id_instituicao,
        i.tx_sigla,
        i.tx_descricao
      FROM professor p
      LEFT JOIN instituicao i ON p.id_instituicao = i.id_instituicao
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: "Erro ao buscar professores",
      details: err.message
    });
  }
});

// Rota para buscar um professor por ID
app.get("/professores/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM professor WHERE id_professor = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Professor não encontrado.");
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao buscar o professor.");
  }
});

// Rota para inserir um novo professor
// Rota para inserir um novo professor
app.post("/professores", async (req, res) => {
  try {
    let { id_instituicao, tx_nome, tx_sexo, tx_estado_civil, dt_nascimento, tx_telefone } = req.body;
    
    // Converte tx_sexo para minúsculas e tx_estado_civil para maiúsculas
    tx_sexo = tx_sexo.toLowerCase();
    tx_estado_civil = tx_estado_civil.toUpperCase();

    const result = await pool.query(
      `INSERT INTO professor 
       (id_instituicao, tx_nome, tx_sexo, tx_estado_civil, dt_nascimento, tx_telefone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id_instituicao, tx_nome, tx_sexo, tx_estado_civil, dt_nascimento, tx_telefone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao inserir professor:", err.message);
    res.status(500).json({ error: "Erro ao criar o professor", detalhes: err.message });
  }
});


// Rota para atualizar um professor existente
app.put("/professores/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let { id_instituicao, tx_nome, tx_sexo, tx_estado_civil, dt_nascimento, tx_telefone } = req.body;

    // Converte tx_sexo para minúsculas e tx_estado_civil para maiúsculas
    tx_sexo = tx_sexo.toLowerCase();
    tx_estado_civil = tx_estado_civil.toUpperCase();

    const result = await pool.query(
      `UPDATE professor
       SET id_instituicao = $1, tx_nome = $2, tx_sexo = $3, tx_estado_civil = $4, dt_nascimento = $5, tx_telefone = $6
       WHERE id_professor = $7
       RETURNING *`,
      [id_instituicao, tx_nome, tx_sexo, tx_estado_civil, dt_nascimento, tx_telefone, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar professor:", err.message);
    res.status(500).json({ error: "Erro ao atualizar o professor", detalhes: err.message });
  }
});



// Rota para deletar um professor
app.delete("/professores/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM professor WHERE id_professor = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Professor não encontrado.");
    }
    res.status(200).send("Professor deletado com sucesso.");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao deletar o professor.");
  }
});

// Rota para listar todas as disciplinas
app.get("/disciplinas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM disciplina");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao buscar disciplinas.");
  }
});

// Rota para buscar disciplinas por curso
app.get("/cursos/:id/disciplinas", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM disciplina WHERE id_curso = $1",
      [id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao buscar disciplinas do curso.");
  }
});

// Rota para buscar uma disciplina por ID
app.get("/disciplinas/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM disciplina WHERE id_disciplina = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Disciplina não encontrada.");
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao buscar a disciplina.");
  }
});

// Rota para inserir uma nova disciplina
app.post("/disciplinas", async (req, res) => {
  const {
    id_curso,
    id_tipo_disciplina,
    tx_sigla,
    tx_descricao,
    in_periodo,
    in_carga_horaria,
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO disciplina (id_curso, id_tipo_disciplina, tx_sigla, tx_descricao, in_periodo, in_carga_horaria) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        id_curso,
        id_tipo_disciplina,
        tx_sigla,
        tx_descricao,
        in_periodo,
        in_carga_horaria,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao criar a disciplina.");
  }
});

// Rota para atualizar uma disciplina
app.put("/disciplinas/:id", async (req, res) => {
  const { id } = req.params;
  const {
    id_curso,
    id_tipo_disciplina,
    tx_sigla,
    tx_descricao,
    in_periodo,
    in_carga_horaria,
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE disciplina 
       SET id_curso = $1, id_tipo_disciplina = $2, tx_sigla = $3, tx_descricao = $4, in_periodo = $5, in_carga_horaria = $6 
       WHERE id_disciplina = $7 RETURNING *`,
      [
        id_curso,
        id_tipo_disciplina,
        tx_sigla,
        tx_descricao,
        in_periodo,
        in_carga_horaria,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Disciplina não encontrada.");
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao atualizar a disciplina.");
  }
});

// Rota para deletar uma disciplina
app.delete("/disciplinas/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM disciplina WHERE id_disciplina = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Disciplina não encontrada.");
    }
    res.status(200).send("Disciplina deletada com sucesso.");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao deletar a disciplina.");
  }
});

// --- CRUD para a tabela "Instituicao" ---

// CREATE - Inserir nova instituição
app.post("/instituicoes", async (req, res) => {
  const { tx_sigla, tx_descricao } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO instituicao (tx_sigla, tx_descricao) VALUES ($1, $2) RETURNING *",
      [tx_sigla, tx_descricao]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - Buscar todas as instituições
app.get("/instituicoes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM instituicao");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - Buscar uma instituição por ID
app.get("/instituicoes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM instituicao WHERE id_instituicao = $1",
      [id]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Instituição não encontrada" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Atualizar uma instituição por ID
app.put("/instituicoes/:id", async (req, res) => {
  const { id } = req.params;
  const { tx_sigla, tx_descricao } = req.body;
  try {
    const result = await pool.query(
      "UPDATE instituicao SET tx_sigla = $1, tx_descricao = $2 WHERE id_instituicao = $3 RETURNING *",
      [tx_sigla, tx_descricao, id]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Instituição não encontrada" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Excluir uma instituição por ID
app.delete("/instituicoes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM instituicao WHERE id_instituicao = $1 RETURNING *",
      [id]
    );
    if (result.rows.length > 0) {
      res.status(200).json({ message: "Instituição excluída com sucesso" });
    } else {
      res.status(404).json({ message: "Instituição não encontrada" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- CRUD para outras tabelas ---
/**
 * Obs: foram implantadas acima
 * De forma similar, você pode criar rotas CRUD para as outras tabelas como `curso`, `professor`, `disciplina`, etc.
 */

// Iniciar o servidor na porta 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
