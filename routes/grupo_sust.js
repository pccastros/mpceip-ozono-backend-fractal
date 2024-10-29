const express = require('express');
const router = express.Router();
const pool = require('../db');
const cors = require('cors');

// Habilita CORS para todas las rutas
router.use(cors());
// Obtener todos los grupo_susts
router.get('/', async (req, res) => {
  try {
      const { rows } = await pool.query('SELECT * FROM public.grupo_sust');
      res.send(rows);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
  }
});

// Obtener solo los grupo_sust activos
router.get('/active', async (req, res) => {
  try {
      const { rows } = await pool.query('SELECT * FROM public.grupo_sust WHERE activo = true');
      res.send(rows);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
  }
});

// Obtener un grupo_sust por su ID
router.get('/:id', (req, res) => {
  // Aquí iría la lógica para obtener un grupo_sust específico usando req.params.id
  res.send(`Detalle del grupo con ID ${req.params.id}`);
});

router.post('/', async (req, res) => {
    const {
      name,activo
    } = req.body;
  
    try {
      // Verificar si el grupo_sust ya existe
      const { rows } = await pool.query('SELECT * FROM public.grupo_sust WHERE name = $1', [name]);
      if (rows.length > 0) {
        return res.status(400).json({ msg: 'El grupo ya existe' });
      }

      console.log('body', req.body);
  
      // Insertar el nuevo grupo_sust en la base de datos
      const newGrupo_sust = await pool.query(
        'INSERT INTO public.grupo_sust (name,activo,created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *',
        [name,activo]
      );
  
      res.json({ msg: 'grupo creado con éxito', grupo_sust: newGrupo_sust.rows[0] });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  });
  

// Actualizar un Grupo_sust
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, activo} = req.body;
  
    try {
        const updateQuery = `
            UPDATE public.grupo_sust
            SET name = $1, activo = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING *;
        `;
        const { rows } = await pool.query(updateQuery, [name,activo, id]);
        //const rows = result.rows;
  
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Grupo no encontrado' });
        }
  
        res.json({ msg: 'Grupo actualizado', grupo_sust: rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({msg: 'Server Error'});
    }
});


// Eliminar un grupo_sust

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
        const deleteQuery = 'DELETE FROM public.grupo_sust WHERE id = $1;';
        const result = await pool.query(deleteQuery, [id]);
  
        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Grupo_sust no encontrado' });
        }
  
        res.json({ msg: 'Grupo eliminado con éxito' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Error del servidor' });
    }
});


// Buscar Grupo por nombre
router.get('/search', async (req, res) => {
    const { name } = req.query; // Obtén el nombre del query string

    try {
        const searchQuery = 'SELECT * FROM public.grupo_sust WHERE name ILIKE $1';
        const { rows } = await pool.query(searchQuery, [`%${name}%`]); // Usar ILIKE para búsqueda insensible a mayúsculas/minúsculas
        
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'No se encontro el grupo con ese nombre' });
        }

        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Error del servidor' });
    }
});

module.exports = router;
