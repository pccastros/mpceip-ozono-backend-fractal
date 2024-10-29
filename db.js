const { Pool } = require('pg');


// const pool = new Pool({
//   user: 'onuapp',
//   host: '108.181.201.110',
//   database: 'onu',
//   password: 'CarlosDiaz!2013',
//   port: 5432,
// });


const pool = new Pool({
  host: 'localhost',
  database: 'mpceip',
  user: 'patbotuser',
  password: 'Pat_2024.Bot',
  port: 5435,
});

module.exports = pool;