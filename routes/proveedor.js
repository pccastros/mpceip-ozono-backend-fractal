const express = require('express');
const router = express.Router();
const pool = require('../db');
const cors = require('cors');

// Habilita CORS para todas las rutas
router.use(cors());
// Obtener todos los usuarios

  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM public.proveedor ORDER BY name');
        res.send(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
  });
  
  // Obtener solo los grupo_sust activos
  router.get('/active', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM public.proveedor WHERE activo = true');
        res.send(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
  });
  

// Obtener un usuario por su ID
router.get('/:id', (req, res) => {
  // Aquí iría la lógica para obtener un usuario específico usando req.params.id
  res.send(`Detalle del proveedor con ID ${req.params.id}`);
});

router.post('/', async (req, res) => {
    const {
      name, country, activo,
    } = req.body;
  
    try {
      // Verificar si el usuario ya existe
      const { rows } = await pool.query('SELECT * FROM public.proveedor WHERE name = $1', [name]);
      if (rows.length > 0) {
        return res.status(400).json({ msg: 'El proveedor ya existe' });
      }

      console.log('body', req.body);
  
      // Insertar el nuevo usuario en la base de datos
      const newProve = await pool.query(
        'INSERT INTO public.proveedor (name, country, activo, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
        [name, country, activo]
      );
  
      res.json({ msg: 'Proveedor creado con éxito', proveedor: newProve.rows[0] });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  });
  

// Actualizar un proveedor
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, country, activo} = req.body;

  try {
      const updateQuery = `
          UPDATE public.proveedor
          SET name = $1, country = $2, activo = $3, updated_at = NOW()
          WHERE id = $4
          RETURNING *;
      `;
      const { rows } = await pool.query(updateQuery, [name, country, activo, id]);
      //const rows = result.rows;

      if (rows.length === 0) {
          return res.status(404).json({ msg: 'proveedor no encontrado' });
      }

      res.json({ msg: 'proveedor actualizado', proveedor: rows[0] });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({msg: 'Server Error'});
  }
});


// Eliminar un proveedor

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const deleteQuery = 'DELETE FROM public.proveedor WHERE id = $1;';
      const result = await pool.query(deleteQuery, [id]);

      if (result.rowCount === 0) {
          return res.status(404).json({ msg: 'proveedor no encontrado' });
      }

      res.json({ msg: 'proveedor eliminado con éxito' });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Error del servidor' });
  }
});


// Buscar proveedores por nombre
router.get('/search', async (req, res) => {
  const { name } = req.query; // Obtén el nombre del query string

  try {
      const searchQuery = 'SELECT * FROM public.proveedor WHERE name ILIKE $1';
      const { rows } = await pool.query(searchQuery, [`%${name}%`]); // Usar ILIKE para búsqueda insensible a mayúsculas/minúsculas
      
      if (rows.length === 0) {
          return res.status(404).json({ msg: 'No se encontraron proveedores con ese nombre' });
      }

      res.json(rows);
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;
