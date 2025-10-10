import express, { Express, Request, Response } from 'express';
import * as dotenv from "dotenv";
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { readFileSync, writeFileSync } from 'fs';
import * as bcrypt from 'bcryptjs';
import { mkdtempDisposable } from 'fs/promises';


dotenv.config()
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const app: Express = express();
app.use(express.json());

const DB_PATH: string = './mydb.sqlite';
let dbinstance: Database | null = null;

//to initailise the database, either returns the db instance or makes one if neccessary
async function initDB(){
  if(dbinstance) return dbinstance;

  const SQL: SqlJsStatic = await initSqlJs();

  try{
    const data = readFileSync(DB_PATH);
    dbinstance = new SQL.Database(data);
  } catch{
    dbinstance = new SQL.Database();
    dbinstance.run(`
    CREATE TABLE IF NOT EXISTS Users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
    `)
  }
  saveDB();

  return dbinstance;
}

function saveDB(){
  if(!dbinstance) return;
  const buffer = dbinstance.export();
  writeFileSync(DB_PATH, Buffer.from(buffer));
}

async function hashPassword(password: string): Promise<{hashedPassword: string | null; hashErr: Error | null;}>{
  try{
    const hashedPassword: string = await bcrypt.hash(password, 10);
    return {hashedPassword, hashErr: null}
  } catch(err){
    console.log()
    return {hashedPassword: null, hashErr: err as Error}
  }
}

app.get('/test', (req: Request, res: Response) => {
  res.status(200).send({"message": "hello from the other side"})
});

app.post('/register', async(req: Request, res: Response) => {
  const username: string = req.body.username ? req.body.username: "";
  const password: string = req.body.password ? req.body.password: "" ;

  //basic validation
  //empty string
  if (username == "" || password == ""){
    res.status(400).send({"error":"username or password missing"});
  }
  //length basis
  if(username.length < 5 || username.length > 15 || password.length < 8 || password.length > 20){
    res.status(400).send({"error":"invalid username or password. Username length should be within 5 and 15. Password length should be within 8 and 20"})
  }

  const {hashedPassword, hashErr} = await hashPassword(password);
  if (hashErr != null){
    console.log("cant hash password", hashErr)
    res.status(500).send({"message":"something went wrong"});
  }

  const conn: Database = await initDB();
  conn.run(`
  INSERT INTO Users(username, password) VALUES ("${username}", "${hashedPassword}")
  `);
  saveDB();

  res.status(200).send({"message":"user registered", "username": username});
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});