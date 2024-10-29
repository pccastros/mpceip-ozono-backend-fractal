const express = require('express');
const router = express.Router();
const pool = require('../db');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
// Habilita CORS para todas las rutas
router.use(cors());

router.get('/:fileId', async (req, res) => {
  try {
    const files = await pool.query('SELECT file FROM public.files WHERE id = $1', [req.params.fileId]);

    // Asegúrate de que el archivo existe
    if (!files.rows[0]) {
      return res.status(404).send('Archivo no encontrado');
    }

    const buffer = files.rows[0].file;
    const base64Data = buffer.toString('base64');


    // Añade el prefijo correcto para un archivo PDF en base64
    const base64PDF = 'data:application/pdf;base64,' + base64Data;

    // Envía la cadena base64 como respuesta
    res.json({ file: base64PDF });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor: ' + err.message);
  }
});


router.post('/', async (req, res) => {
    const {
      name, file
    } = req.body;
  
    try {
      console.log('body', req.body);
      const buffer = Buffer.from(file, 'base64');
  
      // Insertar el nuevo usuario en la base de datos
      const newFile = await pool.query(
        'INSERT INTO public.files (name, file, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *',
        [name, buffer]
      );
  
      res.json({ msg: 'Archivo creado con éxito', file: newFile.rows[0].id });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error del servidor');
    }
  });





module.exports = router;

