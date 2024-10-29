const express = require('express');
const router = express.Router();
const pool = require('../db');
const cors = require('cors');

// Habilita CORS para todas las rutas
router.use(cors());
// Obtener todos los paiss
router.get('/', async (req, res) => {
    /*const { rows } = await pool.query('SELECT * FROM public.pais');
    res.send(rows);*/

    try {
      const { rows } = await pool.query('SELECT * FROM public.pais ORDER BY name');
      res.json(rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  });

// Obtener un pais por su ID
router.get('/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const { rows } = await pool.query('SELECT * FROM public.pais WHERE id = $1', [id]);
      if (rows.length === 0) {
          return res.status(404).json({ msg: 'País no encontrado' });
      }
      res.json(rows[0]);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
  }
});

router.post('/', async (req, res) => {
    const {
      name
    } = req.body;
  
    try {
      // Verificar si el pais ya existe
      const { rows } = await pool.query('SELECT * FROM public.pais WHERE name = $1', [name]);
      if (rows.length > 0) {
        return res.status(400).json({ msg: 'El pais ya existe' });
      }

      console.log('body', req.body);
  
      // Insertar el nuevo pais en la base de datos
      const newPais = await pool.query(
        'INSERT INTO public.pais (name,created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *',
        [name]
      );
  
      res.json({ msg: 'Pais creado con éxito', pais: newPais.rows[0] });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  });
  

// Actualizar un país
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name} = req.body;
  
    try {
        const updateQuery = `
            UPDATE public.pais
            SET name = $2, updated_at = NOW()
            WHERE id = $1
            RETURNING *;
        `;
        const { rows } = await pool.query(updateQuery, [id, name]);
        //const rows = result.rows;
  
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'País no encontrado' });
        }
  
        res.json({ msg: 'País actualizado', pais: rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({msg: 'Server Error'});
    }
});


// Eliminar un pais

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
        const deleteQuery = 'DELETE FROM public.pais WHERE id = $1;';
        const result = await pool.query(deleteQuery, [id]);
  
        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'País no encontrado' });
        }
  
        res.json({ msg: 'País eliminado con éxito' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Error del servidor' });
    }
});


// Buscar países por nombre
router.get('/search', async (req, res) => {

  const { name } = req.query; // Obtén el nombre del query string
    
    try {
        
        const searchQuery = 'SELECT * FROM public.pais WHERE name ILIKE $1';
        const { rows } = await pool.query(searchQuery, [`%${name}%`]); // Usar ILIKE para búsqueda insensible a mayúsculas/minúsculas
        
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'No se encontraron países con ese nombre' });
        }

        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Error del servidor' });
    }
});

module.exports = router;
