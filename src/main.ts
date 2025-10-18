import express, { Express, NextFunction, Request, Response } from 'express';
import * as dotenv from "dotenv";
import * as bcrypt from 'bcryptjs';

dotenv.config()
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const app: Express = express();
app.use(express.json());


//this route is to test only
app.get('/test', (req: Request, res: Response) => {
    res.status(200).send({"message": "hello from the other side"})
});

//auth starts here - need to refactor them into a separate files later
//register route
app.post('/register', async(req: Request, res:  Response) => {

    //containers to hold the fields after validation
    let username: string;
    let password: string;
    let hashedPassword: string;

    //check if there
    if(!req.body.username || !req.body.password){
        console.log("missing feild while registering")
        return res.status(400).send({"error":"missing username or password"});
    }

    //check the types
    if(typeof(req.body.username) != "string" || typeof(req.body.password) != "string"){
        console.log("type mismatch in feilds while registering")
        return res.status(400).send({"error":"invalid type of username or password"});
    }

    //check length
    if((req.body.username).length < 5 || (req.body.username).length > 15 || (req.body.password).length < 8 || (req.body.password).length > 20){
        console.log("length mismatch while registering");
        return res.status(400).send({"error":"length of username should be 5-15 and password should be 8-20"});
    }

    //check if it has special characters
    const specialChars: string = "!#$%^&*()_+=-{}<>,.\/`~";
    for(const char of req.body.username){
        if (specialChars.includes(char)){
            console.log("registering username has special chars");
            return res.status(400).send({"error":"username cannot include special characters"});
        }
    }
    for(const char of req.body.password){
        if (specialChars.includes(char)){
            console.log("registering password has special chars");
            return res.status(400).send({"error":"password cannot include special characters"});
        }
    }

    //after integrating database, would need to check if duplicate exists

    //finally putting it in the containers for later scalability uses
    username = req.body.username;
    password = req.body.password;

    //hashing the password for later storage
    try{
        hashedPassword = await hashPass(password);
    } catch(err){
        console.log("error while hashing password: ", err);
        return res.status(500).send({"error":"something went wrong"});
    }

    //after integrating database, would need to store this two feilds

    console.log("user is registered by username: ", username);
    res.status(200).send({"message":"user registered successfully", "username": username});
});

async function hashPass(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});