import * as mariadb from 'mariadb';
import 'dotenv/config'; // Lädt die .env Variablen automatisch in process.env

// Connection Pool erstellen
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5 // Begrenzt die gleichzeitigen Verbindungen
});

export default pool;