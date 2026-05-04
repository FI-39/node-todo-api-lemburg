import http from "http";
import pool from "./db/pool.js";
import express from "express";

const PORT = process.env.PORT || 3000;
const app = express();

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// for parsing application/json
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hallo Express!");
});

// Get all todos
app.get("/api/todos", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const todos = await conn.query("SELECT * FROM todo");
    res.status(200).json(todos);
  } catch (error) {
    console.error("Datenbankfehler:", error);
    res.status(500).json({ error: "Serverfehler" });
  } finally {
    if (conn) conn.release();
  }
});

// Get todo by ID
app.get("/api/todos/:id", async (req, res) => {
  const { id } = req.params;

  let conn;
  try {
    conn = await pool.getConnection();
    const todo = await conn.query("SELECT * FROM todo WHERE id=?", [id]);
    console.log(todo);
    if (todo.length === 0) {
      return res
        .status(404)
        .json({ error: `Can't find todo with id '${id}'.` });
    }
    res.status(200).json(todo[0]);
  } catch (error) {
    console.error("Datenbankfehler:", error);
    res.status(500).json({ error: "Serverfehler" });
  } finally {
    if (conn) conn.release();
  }
});

// Create new todo
app.post("/api/todos", async (req, res) => {
  //check if title is provided
  if (!req.body || !req.body.title) {
    return res.status(400).json({ error: "Titel ist erforderlich" });
  }

  const { title } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query("INSERT INTO todo (title) VALUES (?)", [
      title,
    ]);

    res.status(201).json({ id: result.insertId, title, completed: false });
  } catch (error) {
    console.error("Datenbankfehler:", error);

    res.status(500).json({ error: "Serverfehler" });
  } finally {
    if (conn) conn.release();
  }
});

// Update todo
app.put("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query("UPDATE todo SET title = ? WHERE id = ?", [title, id]);
    res.status(200).json({ id, title });
  } catch (error) {
    res.status(500).json({ error: "Serverfehler" });
    1;
    if (conn) conn.release();
  }
});

// Delete todo
app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query("DELETE FROM todo WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Todo nicht gefunden" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Serverfehler" });
  } finally {
    if (conn) conn.release();
  }
});

// Patch todo
app.patch("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();

    // Einfaches Update-Statement ohne SQL-Funktionen
    const result = await conn.query(
      "UPDATE todo SET title = ?, completed = ? WHERE id = ?",
      [title, completed, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Todo nicht gefunden" });
    }

    res.status(200).json({ id, title, completed });
  } catch (error) {
    res.status(500).json({ error: "Serverfehler" });
  } finally {
    if (conn) conn.release();
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://linuxvm.mshome.net:${PORT}`);
});
// const server = http.createServer(async (req, res) => {
//     // Standard-Header für JSON-Antworten setzen
//     res.setHeader('Content-Type', 'application/json');

//     // Route: GET /api/todos
//     if (req.method === 'GET' && req.url === '/api/todos') {
//         let conn;
//         try {
//             // 1. Verbindung aus dem Pool anfordern
//             conn = await pool.getConnection();

//             // 2. Todos aus der Datenbank abfragen
//             const todos = await conn.query("SELECT * FROM todo");

//             // 3. Erfolgreiche Antwort senden (Status 200)
//             res.writeHead(200);
//             res.end(JSON.stringify(todos));

//         } catch (error) {
//             // Fehlerbehandlung (z.B. wenn die DB nicht erreichbar ist)
//             console.error("Fehler bei der Datenbankabfrage:", error);
//             res.writeHead(500);
//             res.end(JSON.stringify({ error: "Interner Serverfehler" }));

//         } finally {
//             // WICHTIG: Verbindung immer wieder in den Pool zurückgeben,
//             // auch wenn ein Fehler aufgetreten ist!
//             if (conn) {
//                 conn.release();
//             }
//         }
//     }
//     // Fallback für alle anderen Routen
//     else {
//         res.writeHead(404);
//         res.end(JSON.stringify({ error: "Route nicht gefunden" }));
//     }
// });
