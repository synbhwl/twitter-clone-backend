import express, { Express, NextFunction, Request, Response } from 'express';
import * as dotenv from "dotenv";
import * as bcrypt from 'bcryptjs';
import { BadRequestError, DatabaseError } from '../types/errors';

dotenv.config()
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const app: Express = express();
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('error: ', err.message);
    if( err instanceof BadRequestError ){
        return res.status(err.status).json({error:err.message});
    } else if (err instanceof DatabaseError) {
        return res.status(err.status).json({error:err.response});
    } else {
        return res.status(500).json({error:"something went wrong"});
    }
})

app.post('/register', async(req: Request, res: Response, next: NextFunction) => {
    try{
        const {username, password} = req.body;

        //some basic validation
        if(!username || !password){
            throw new BadRequestError('username or password missing');
        }

        if(username.length < 5 || username.length > 20){
            throw new BadRequestError('username must be between 5 and 20');
        }

        
        if(username.length < 8 || username.length > 40){
            throw new BadRequestError('username must be between 5 and 20');
        }

        //later add regex

        if(password == 'abcdefgh'){
            throw new DatabaseError('password is abc and hence cannot be used', 'something went wrong');
        }
    
        res.status(200).json({message:`${username} is registered`});  
    }catch(err){
        next(err);
    }

});