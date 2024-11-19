const express = require('express');
const router = express.Router();
const pool = require('../db');
const cors = require('cors');

// Habilita CORS para todas las rutas
router.use(cors());
// Obtener todos los importador
router.get('/', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM public.importador WHERE activo = true ORDER BY name');
    res.send(rows);
  });

// Obtener un importador por su ID
router.get('/:id', (req, res) => {
  // Aquí iría la lógica para obtener un importador específico usando req.params.id
  res.send(`Detalle del importador con ID ${req.params.id}`);
});


// Obtener un importador sustancia
router.get('/sustancia/:sustanciaId', async (req, res) => {
  
  console.log("AUIII")
  console.log(req.params.sustanciaId)
  try {
    // const { rows } = await pool.query(`SELECT im.*
    //   FROM public.importador_sustancia is2
    //   INNER JOIN public.grupo_sust gs ON is2.grupo_sust_id = gs.id
    //   INNER JOIN public.importador im ON is2.importador_id = im.id
    //   WHERE gs.name = '${req.params.sustanciaId}'
    //   ORDER BY im.name`);

    const { rows } = await pool.query(`
    SELECT *
    FROM public.cupo cu
    INNER JOIN public.importador im ON cu.importador_id = im.id
    WHERE cu.${req.params.sustanciaId.toLowerCase()}::numeric > 0
    AND cu.activo = true
  `);

      console.log(rows)
    res.send(rows);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
  }

});

router.post('/', async (req, res) => {
    const {
      name, ruc, phone, user_import
    } = req.body;
  
    try {
      // Verificar si el importador ya existe
      const { rows } = await pool.query('SELECT * FROM public.importador WHERE name = $1', [name]);
      if (rows.length > 0) {
        return res.status(400).json({ msg: 'El Importador ya existe' });
      }

      console.log('body', req.body);
  
      // Insertar el nuevo importador en la base de datos
      const newProve = await pool.query(
        'INSERT INTO public.importador (name, ruc,phone, user_import, created_at, updated_at) VALUES ($1, $2, $3, $4,NOW(), NOW()) RETURNING *',
        [name, ruc,phone, user_import]
      );
  
      res.json({ msg: 'Importador creado con éxito', importador: newProve.rows[0] });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  });
  

// Actualizar un importador
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, ruc,phone, user_import, id_user} = req.body;

  console.log(req.body);

  try {
      const updateQuery = `
          UPDATE public.importador
          SET name = $1, ruc = $2, phone = $3, user_import = $4, id_user = $5, updated_at = NOW()
          WHERE id = $6
          RETURNING *;
      `;
      const { rows } = await pool.query(updateQuery, [name, ruc,phone, user_import, id_user, id]);
      //const rows = result.rows;

      if (rows.length === 0) {
          return res.status(404).json({ msg: 'importador no encontrado' });
      }

      res.json({ msg: 'importador actualizado', importador: rows[0] });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({msg: 'Server Error'});
  }
});


// Eliminar un importador

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const deleteQuery = 'DELETE FROM public.importador WHERE id = $1;';
      const result = await pool.query(deleteQuery, [id]);

      if (result.rowCount === 0) {
          return res.status(404).json({ msg: 'importador no encontrado' });
      }

      res.json({ msg: 'importador eliminado con éxito' });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Error del servidor' });
  }
});


// Buscar importadores por nombre
router.get('/search', async (req, res) => {
  const { name } = req.query; // Obtén el nombre del query string

  try {
      const searchQuery = 'SELECT * FROM public.importador WHERE name ILIKE $1';
      const { rows } = await pool.query(searchQuery, [`%${name}%`]); // Usar ILIKE para búsqueda insensible a mayúsculas/minúsculas
      
      if (rows.length === 0) {
          return res.status(404).json({ msg: 'No se encontraron importadores con ese nombre' });
      }

      res.json(rows);
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;
