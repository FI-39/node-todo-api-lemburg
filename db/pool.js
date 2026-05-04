import * as mariadb from 'mariadb';
import 'dotenv/config'; // Lädt die .env Variablen automatisch in process.env

// Connection Pool erstellen
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5, // Begrenzt die gleichzeitigen Verbindungen

    // Konvertiert BIGINT-Spalten automatisch in JavaScript-Zahlen (Number).
    // Standardmäßig liefert der Treiber BIGINT als String zurück, um Präzisionsverlust 
    // zu vermeiden, da JS-Zahlen nur bis 2^53 - 1 sicher sind.
    bigIntAsNumber: true,

    // Sorgt dafür, dass die 'insertId' (die ID eines neu eingefügten Datensatzes) 
    // direkt als Zahl und nicht als String zurückgegeben wird.
    insertIdAsNumber: true,
});

export default pool;