import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: '123456',
  database: 'likeme',
  allowExitOnIdle: true,
});

const app = express();


app.use(cors()); 
app.use(express.json());

app.get('/posts', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM posts');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener los posts:', error);
    res.status(500).send('Error en el servidor');
  }
});

app.post('/posts', async (req, res) => {
  const { titulo, img, descripcion, likes } = req.body;
  try {
    const query = 'INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, $4)';
    const values = [titulo, img, descripcion, likes];
    await pool.query(query, values);
    res.send('Post agregado con éxito');
  } catch (error) {
    console.error('Error al agregar el post:', error);
    res.status(500).send('Error en el servidor');
  }
});

app.delete('/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM posts WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    res.json({ message: "Post eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el post:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});



app.put('/posts/:id/like', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      UPDATE posts 
      SET likes = COALESCE(likes, 0) + 1 
      WHERE id = $1 
      RETURNING *`;
    
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    res.json({ message: "Like agregado con éxito", post: rows[0] });
  } catch (error) {
    console.error('Error al actualizar likes:', error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

