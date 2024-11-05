const express = require('express');
const router = express.Router();
const pool = require('../db');
const cors = require('cors');

// Habilita CORS para todas las rutas
router.use(cors());

// Obtener importaciones por importador con estado Aprobado
router.get('/importador/:importador', async (req, res) => {
  const { importador } = req.params;
  try {
    const statuses = ['Aprobado', 'Confirmado', 'Validado'];
    const { rows } = await pool.query('SELECT * FROM public.importacion WHERE importador_id = $1 AND status = ANY($2) ORDER BY id DESC', [importador, statuses]);    
    console.log(rows)

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Importacion no encontrada' });
    }
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor'+err.message);
  }
});


// Obtener todos los importacion
router.get('/', async (req, res) => {
    try {
        // Consultar maestro
        const masterQuery = 'SELECT id,created_at::date,updated_at::date,authorization_date::date,solicitud_date::date,month,cupo_asignado,status,cupo_restante,total_solicitud,total_pesoKg,vue,importador,user_id,years,country,proveedor,send_email,grupo,data_file_id,dai_file_id,factura_file_it FROM public.importacion ORDER BY id';
        const masterResult = await pool.query(masterQuery);

        if (masterResult.rows.length === 0) {
            return res.status(404).json({ message: 'Master records not found' });
        }

        // Consultar detalles asociados a cada maestro
        //for (let i = 0; i < masterResult.rows.length; i++) {
        //  const detailQuery = `SELECT * FROM public.importacion_detail WHERE importacion = ${masterResult.rows[i].id}`;
         // const detailResult = await pool.query(detailQuery);
         // masterResult.rows[i].details = detailResult.rows;
       // }

        console.log(masterResult.rows[0]);
        res.json(masterResult.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'+err.message);
    }
  });
  // Obtener todos los importacion por el id del importador
router.get('/:importacion', async (req, res) => {
  console.log(req.params);
    const { importacion } = req.params;
    try {

        // Consultar maestro
        const masterQuery = 'SELECT * FROM public.importacion where id = $1';
        const masterResult = await pool.query(masterQuery, [importacion]);

        if (masterResult.rows.length === 0) {
            return res.status(404).json({ message: 'Master records not found' });
        }

        // Consultar detalles asociados a cada maestro
        for (let i = 0; i < masterResult.rows.length; i++) {
          const detailQuery = `SELECT * FROM public.importacion_detail WHERE importacion = ${masterResult.rows[i].id}`;
          const detailResult = await pool.query(detailQuery);
          masterResult.rows[i].details = detailResult.rows;
        }
        res.json(masterResult.rows);

      }

    catch (err) {

        console.error(err.message);
        res.status(500).send('Server Error');
    }
  });


//Trae solo el total de la solicitud de importacion para calcular el cupo restate
router.get('/cuposolicitud/:importador', async (req, res) => {
    const { importador } = req.params;
    const { filtro } = req.query;

    try {
        const { rows } = await pool.query('SELECT COALESCE(sum(total_solicitud), 0) as total_solicitud FROM public.importacion WHERE importador = $1 AND grupo = UPPER($2)', [importador, filtro]);

      if (rows.length === 0) {
        return res.status(404).json({ msg: 'Importacion no encontrada' });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor'+err.message);
    }});

router.post('/', async (req, res) => {
  const body = req.body;
  try {
    // Iniciar transacción
    await pool.query('BEGIN');

    // Verificar si ya existe un registro con el mismo 'vue'
    const checkDuplicate = 'SELECT COUNT(*) FROM public.importacion WHERE vue = $1';
    const duplicateResult = await pool.query(checkDuplicate, [body.vue]);

    if (duplicateResult.rows[0].count > 0) {
      // Si existe un duplicado, lanzar un error
      return res.status(400).json({ message: 'Ya existe una importación con el mismo vue' });
    }

    // Insertar en la tabla maestra
    const masterInsert = 'INSERT INTO public.importacion(authorization_date::date,solicitud_date::date, month, cupo_asignado, status, cupo_restante, total_solicitud, total_pesokg, vue, data_file_id, importador, years, country, proveedor, grupo, importador_id,created_at::date, updated_at::date) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,$15,$16,NOW(),NOW()) RETURNING id';
    const masterValues = [body.authorization_date,body.solicitud_date, body.month, body.cupo_asignado, body.status, body.cupo_restante, body.total_solicitud, body.total_pesokg, body.vue, body.data_file_id, body.importador, body.years, body.pais, body.proveedor, body.grupo, body.importador_id];
    const masterResult = await pool.query(masterInsert, masterValues);

    // Insertar en la tabla de detalles
    for (const detail of body.details) {
      const detailInsert = 'INSERT INTO public.importacion_detail(cif, fob, peso_kg, peso_pao, sustancia, subpartida, ficha_id, importacion,created_at::date, updated_at::date) VALUES($1, $2, $3, $4, $5, $6, $7, $8,NOW(),NOW())';
      const detailValues = [detail.cif, detail.fob, detail.peso_kg, detail.pao, detail.sustancia, detail.subpartida, detail.ficha_id, masterResult.rows[0].id];
      await pool.query(detailInsert, detailValues);
    }

    await pool.query('COMMIT');
    res.status(201).json({ message: 'Importación creada con éxito' });
    } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Error del servidor'+err.message);
  }
});

// Establecer el mecanismo para delete por id con el método DELETE master y detail
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try
  {
    await pool.query('BEGIN');
    await pool.query('DELETE FROM public.importacion_detail WHERE importacion = $1', [id]);
    await pool.query('DELETE FROM public.importacion WHERE id = $1', [id]);
    await pool.query('COMMIT');
    res.json(`Importación ${id} eliminada con éxito`);
  }
  catch (err
  ) {
    await pool.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Error del servidor'+err.message);
  }
}
);

// Aprobar importacion por id
router.put('/status/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE public.importacion SET status = $1 WHERE id = $2', ['Aprobado', id]);
    res.json(`Importación ${id} aprobada con éxito`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor'+err.message);
  }
});

// Confirmar importacion por id
router.put('/confirm/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE public.importacion SET status = $1 WHERE id = $2', ['Confirmado', id]);
    res.json(`Importación ${id} confirmada con éxito`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor'+err.message);
  }
});

// Validar importacion por id
router.put('/validate/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE public.importacion SET status = $1 WHERE id = $2', ['Validado', id]);
    res.json(`Importación ${id} confirmada con éxito`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor'+err.message);
  }
});

router.put('/fileimport/:id', async (req, res) => {
  try {
    console.log(req.body);
    const id = req.params.id;
    const dai_file_id = req.body.dai_file_id;
    const factura_file_it = req.body.factura_file_it;
    await pool.query('UPDATE public.importacion SET dai_file_id = $1, factura_file_it= $2 WHERE id = $3', [dai_file_id,factura_file_it, id]);
    res.json(`Importación ${id} actualizada con éxito`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor'+err.message);
  }
}
);

router.put('/', async (req, res) => {

  const body = req.body;
  try {
    console.log(req.body);
    const id = req.body.id;

    // Iniciar transacción
    await pool.query('BEGIN');

    // Actualizar en la tabla maestra
    const masterUpdate
      = 'UPDATE public.importacion SET cupo_restante = $1, total_solicitud = $2, total_pesokg = $3, updated_at = NOW() WHERE id = $4';
    const masterValues = [body.cupo_restante, body.total_solicitud, body.total_pesokg, body.id];
    await pool.query(masterUpdate, masterValues);
    res.json(`Importación ${id} actualizada con éxito`);


  }
  catch (err
  ) {
    await pool.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Error del servidor'+err.message);
  }
}
);

router.put('/aprobacion', async (req, res) => {

  const body = req.body;
  try {
    console.log(req.body);
    console.log(req.body.factura_file_it);
    console.log(req.body.dai_file_id);

    const id = req.body.id;

    // Iniciar transacción
    await pool.query('BEGIN');

    // Actualizar en la tabla maestra
    const masterUpdate
      = 'UPDATE public.importacion SET factura_file_it = $1, dai_file_id = $2, updated_at = NOW() WHERE id = $3';
    const masterValues = [body.factura_file_it, body.dai_file_id, body.id];
    await pool.query(masterUpdate, masterValues);
    await pool.query('COMMIT');
    res.json(`Importación ${id} actualizada con éxito`);
  }
  catch (err
  ) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Error del servidor'+err.message);
  }
}


);
module.exports = router;
