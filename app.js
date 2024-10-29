const express = require('express');
const userRoutes = require('./routes/users');
const importadorRoutes = require('./routes/importador');
const paisRoutes = require('./routes/pais');
const proveedorRoutes = require('./routes/proveedor');
const sustanciaRoutes = require('./routes/sustancia');
const anioRoutes = require('./routes/anio');
const cupoRoutes = require('./routes/cupo');
const gruposustRoutes = require('./routes/grupo_sust');
const importRoutes = require('./routes/importacion');
const uploadRoutes = require('./routes/upload');

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));



app.use(express.json()); // Para parsear JSON en el cuerpo de las peticiones

app.use('/api/users', userRoutes);
app.use('/api/users/login', userRoutes);

app.use('/api/importadors', importadorRoutes);
app.use('/api/paises', paisRoutes);

app.use('/api/proveedors', proveedorRoutes);

app.use('/api/sustancias', sustanciaRoutes);

app.use('/api/anios', anioRoutes);

app.use('/api/gruposusts', gruposustRoutes);

app.use('/api/cupos', cupoRoutes);

app.use('/api/importacion', importRoutes);

app.use('/api/upload', uploadRoutes);

app.use('/api/importacion/cuposolicitud', importRoutes);
app.use('/api/importacion/aprove', importRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


///////////////////////////////////////////////////
/*


app.use(express.json()); // Para parsear JSON en el cuerpo de las peticiones

app.use('/users', userRoutes);
app.use('/users/login', userRoutes);

app.use('/importadors', importadorRoutes);
app.use('/paises', paisRoutes);

app.use('/proveedors', proveedorRoutes);
app.use('/proveedors/all', proveedorRoutes);
app.use('/proveedors/active', proveedorRoutes);

app.use('/sustancias', sustanciaRoutes);
app.use('/sustancias/all', sustanciaRoutes);
app.use('/sustancias/active', sustanciaRoutes);

app.use('/anios', anioRoutes);
app.use('/anios/all', anioRoutes);
app.use('/anios/active', anioRoutes);

app.use('/gruposusts', gruposustRoutes);
app.use('/gruposusts/all', gruposustRoutes);
app.use('/gruposusts/active', gruposustRoutes);

app.use('/cupos', cupoRoutes);
app.use('/importacion', importRoutes);

app.use('/upload', uploadRoutes);

app.use('/importacion/cuposolicitud', importRoutes);
app.use('/importacion/aprove', importRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
*/
