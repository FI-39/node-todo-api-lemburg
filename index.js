import http from 'http';
import pool from './db/pool.js';

const PORT = 3000;

const server = http.createServer(async (req, res) => {
    // Standard-Header für JSON-Antworten setzen
    res.setHeader('Content-Type', 'application/json');

    // Route: GET /api/todos
    if (req.method === 'GET' && req.url === '/api/todos') {
        let conn;
        try {
            // 1. Verbindung aus dem Pool anfordern
            conn = await pool.getConnection();
            
            // 2. Todos aus der Datenbank abfragen
            const todos = await conn.query("SELECT * FROM todo");
            
            // 3. Erfolgreiche Antwort senden (Status 200)
            res.writeHead(200);
            res.end(JSON.stringify(todos));
            
        } catch (error) {
            // Fehlerbehandlung (z.B. wenn die DB nicht erreichbar ist)
            console.error("Fehler bei der Datenbankabfrage:", error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: "Interner Serverfehler" }));
            
        } finally {
            // WICHTIG: Verbindung immer wieder in den Pool zurückgeben, 
            // auch wenn ein Fehler aufgetreten ist!
            if (conn) {
                conn.release();
            }
        }
    } 
    // Fallback für alle anderen Routen
    else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Route nicht gefunden" }));
    }
});

server.listen(3000, '0.0.0.0', () => {
    console.log(`Server läuft auf http://linuxvm.mshome.net:${PORT}`);
});