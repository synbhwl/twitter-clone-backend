import { Database } from "sqlite3";

export let db: Database;

const sqlite3 = require('sqlite3').verbose();
db = new sqlite3.Database('./mydb.db', (err: { message: any; }) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );`, (err) => {
                if(err){
                    console.error('cannot make table', err.message);
                } else {
                    console.log('table created');
                }
            });
    }
});

