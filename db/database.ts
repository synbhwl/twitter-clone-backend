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
            password TEXT NOT NULL,
            user_id TEXT NOT NULL UNIQUE
        );`, (err) => {
                if(err){
                    console.error('cannot make users table', err.message);
                } else {
                    console.log('users table created');
                }
            }
        );
        db.run(`CREATE TABLE IF NOT EXISTS tweets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            tweet_id TEXT UNIQUE NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%S', 'NOW', 'localtime'))
        );`, (err) => {
                if(err){
                    console.error('cannot make tweets table', err.message);
                } else {
                    console.log('Tweets table created');
                }
            }
        );
    }
});

