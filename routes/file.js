const express = require('express');
const router = express.Router();
const pool = require('../db');
const cors = require('cors');

// Habilita CORS para todas las rutas
router.use(cors());
// Obtener todos los files
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM public.files');
      res.send(rows);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
  }
});

// Obtener solo los grupo_sust activos
router.get('/active', async (req, res) => {
  try {
      const { rows } = await pool.query('SELECT * FROM public.files');
      res.send(rows);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
  }
});

// Obtener un file por su ID
router.get('/:id', async (req, res) => {
  // Aquí iría la lógica para obtener un file específico usando req.params.id
  // res.send(`Detalle del file con ID ${req.params.id}`);
  try {
    const { rows } = await pool.query(`SELECT * FROM public.files WHERE id = ${req.params.id} LIMIT 1`);
    res.send(rows);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
  }
});

/*
router.post('/', async (req, res) => {
    const {
      name,activo
    } = req.body;
  
    try {
      // Verificar si el anio ya existe
      const { rows } = await pool.query('SELECT * FROM public.anio WHERE name = $1', [name]);
      if (rows.length > 0) {
        return res.status(400).json({ msg: 'El anio ya existe' });
      }

      console.log('body', req.body);
  
      // Insertar el nuevo anio en la base de datos
      const newAnio = await pool.query(
        'INSERT INTO public.anio (name,activo,created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *',
        [name,activo]
      );
  
      res.json({ msg: 'anio creado con éxito', anio: newAnio.rows[0] });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  });
  

  
// Actualizar un Anio
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, activo} = req.body;
  
    try {
        const updateQuery = `
            UPDATE public.anio
            SET name = $1, activo = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING *;
        `;
        const { rows } = await pool.query(updateQuery, [name,activo, id]);
        //const rows = result.rows;
  
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Anio no encontrado' });
        }
  
        res.json({ msg: 'Anio actualizado', anio: rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({msg: 'Server Error'});
    }
});


// Eliminar un anio

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
        const deleteQuery = 'DELETE FROM public.anio WHERE id = $1;';
        const result = await pool.query(deleteQuery, [id]);
  
        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Anio no encontrado' });
        }
  
        res.json({ msg: 'Anio eliminado con éxito' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Error del servidor' });
    }
});


// Buscar Anioes por nombre
router.get('/search', async (req, res) => {
    const { name } = req.query; // Obtén el nombre del query string

    try {
        const searchQuery = 'SELECT * FROM public.anio WHERE name ILIKE $1';
        const { rows } = await pool.query(searchQuery, [`%${name}%`]); // Usar ILIKE para búsqueda insensible a mayúsculas/minúsculas
        
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'No se encontraron Anioes con ese nombre' });
        }

        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Error del servidor' });
    }
});

*/
module.exports = router;
