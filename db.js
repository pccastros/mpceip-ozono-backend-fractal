const { Pool } = require('pg');


const pool = new Pool({
   user: 'ozono_userdb',
   host: 'db-desarrollo.c7uocs6ey8gc.us-west-2.rds.amazonaws.com',
   database: 'onu',
   password: 'V9SNIJ2HLl0ZU23uFRW4',
   port: 4345,
   ssl: {
    require: true,
    rejectUnauthorized: false, // Para desarrollo; en producción, configúralo en `true`
  }
 });


/*const pool = new Pool({
  host: 'localhost',
  database: 'mpceip',
  user: 'patbotuser',
  password: 'Pat_2024.Bot',
  port: 5435,
});
*/
module.exports = pool;
