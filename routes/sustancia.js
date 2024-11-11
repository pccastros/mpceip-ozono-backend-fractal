const express = require('express');
const router = express.Router();
const pool = require('../db');
const cors = require('cors');

// Habilita CORS para todas las rutas
router.use(cors());
// Obtener todos los Sustancias

  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM public.sustancia ORDER BY name');
        res.send(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
  });
  
  // Obtener solo los grupo_sust activos
  router.get('/active', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM public.sustancia WHERE activo = true');
        res.send(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
  });

  // Obtener solo los grupo_sust activos
  router.get('/grupo/:grupoId', async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT * FROM public.sustancia WHERE sustancia.grupo_sust = '${req.params.grupoId}' AND activo = true ORDER BY sustancia.name`);
        res.send(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
  });

// Obtener un Sustancia por su ID
router.get('/:id', (req, res) => {
  // Aquí iría la lógica para obtener un Sustancia específico usando req.params.id
  res.send(`Detalle del Sustancia con ID ${req.params.id}`);
});

router.post('/', async (req, res) => {
    const {
        name, subpartida, pao, pcg, grupo_sust, activo, cupo_prod
    } = req.body;
  
    try {
      // Verificar si el Sustancia ya existe
      const { rows } = await pool.query('SELECT * FROM public.sustancia WHERE name = $1', [name]);
      if (rows.length > 0) {
        return res.status(400).json({ msg: 'La Sustancia ya existe' });
      }

      console.log('body', req.body);
  
      // Insertar el nuevo Sustancia en la base de datos
      const newSust = await pool.query(
        'INSERT INTO public.sustancia (name, subpartida, pao, pcg, grupo_sust, activo, cupo_prod, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *',
        [name, subpartida, pao, pcg, grupo_sust, activo, cupo_prod]
      );
  
      res.json({ msg: 'Sustancia creado con éxito', sustancia: newSust.rows[0] });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  });
  

// Actualizar un sustancia
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, subpartida, pao, pcg, grupo_sust, activo, cupo_prod} = req.body;

  try {
      const updateQuery = `
          UPDATE public.sustancia
          SET name = $1, subpartida =$2, pao = $3, pcg = $4, grupo_sust = $5, activo = $6, cupo_prod = $7, updated_at = NOW()
          WHERE id = $8
          RETURNING *;
      `;
      const { rows } = await pool.query(updateQuery, [name, subpartida, pao, pcg, grupo_sust, activo, cupo_prod, id]);
      //const rows = result.rows;

      if (rows.length === 0) {
          return res.status(404).json({ msg: 'Sustancia no encontrado' });
      }

      res.json({ msg: 'Sustancia actualizada', sustancia: rows[0] });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({msg: 'Server Error'});
  }
});


// Eliminar un sustancia

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const deleteQuery = 'DELETE FROM public.sustancia WHERE id = $1;';
      const result = await pool.query(deleteQuery, [id]);

      if (result.rowCount === 0) {
          return res.status(404).json({ msg: 'Sustancia no encontrado' });
      }

      res.json({ msg: 'Sustancia eliminado con éxito' });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Error del servidor' });
  }
});


// Buscar sustancias por nombre
router.get('/search', async (req, res) => {
  const { name } = req.query; 

  try {    
    const searchQuery = 'SELECT * FROM public.sustancia WHERE name ILIKE $1 AND activo = TRUE';
    
    const values = [`%${name || ''}%`];
    const { rows } = await pool.query(searchQuery, values);
    
    if (rows.length === 0) {
      // No se encontraron registros
      return res.status(404).json({ msg: 'No se encontraron sustancias con ese nombre que estén activas' });
    }

    res.json(rows);
  } catch (err) {  
    console.error(err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});


module.exports = router;
