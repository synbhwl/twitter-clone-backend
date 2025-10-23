import express, { Express, NextFunction, Request, Response } from 'express';
import * as dotenv from "dotenv";
import * as bcrypt from 'bcryptjs';
import { BadRequestError, DatabaseError } from '../types/errors';
import { db } from '../db/database';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { port, jwtKey } from '../config/config';
import { authMiddleware } from '../middlewares/authmw';
import { getRandomId } from '../utils/generateId';

// dotenv.config()
// const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8080;
// const jwtKey: any = process.env.JWT_SECRET_KEY;
// if(!jwtKey){
//     console.error('cannot read JWT key');
// }

const app: Express = express();
app.use(express.json());

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
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

        //gotta hash the password
        const hashedPassword: string = await bcrypt.hash(password, 12);

        //gotta make an userId
        const userId: string = getRandomId();

        //just in case, gotta check for duplicate

        //gotta add the thing in database
        db.run(`INSERT INTO users (username, password, user_id) VALUES (?, ?, ?);`, [username, hashedPassword, userId], (err) => {
            if (err) {
                if(err.message.startsWith('SQLITE_CONSTRAINT: UNIQUE constraint failed')){
                    return res.status(400).json({ error: 'username or id already taken'});
                }
                console.error(`Database error: ${err.message}`);
                return res.status(500).json({ error: 'Error creating user'});
            }
        
            console.log('User added to the database');
            return res.status(201).json({ message: 'User created successfully', user:{username: username, userId: userId}});
        });
         
    }catch(err){
        next(err);
    }

});

app.post('/login', async(req: Request, res: Response, next: NextFunction) => {
    try{
        const {username, password} = req.body;

        //validate it later, for now we gonna go with core logic

        //database seeing
        db.get(`SELECT user_id, username, password FROM users WHERE username = ?`, [username], async(err, row: {username: string, password:string, user_id:string})=>{
            if(err){
                console.error('error while fetching user data for login', err.message);
                return res.status(500).json({error:'cant fetch user data fot login'});
            }

            if(!row){
                console.error('no such username found');
                return res.status(404).json({error:'no such username found'});
            }

            if(row){
                const isMatch: boolean = await bcrypt.compare(password, row.password);

                if(!isMatch){
                    return res.status(403).json({error:'wrong password'});
                }

                const payload: JwtPayload = {
                    userId: row.user_id,
                    username: row.username
                }

                console.log('payload is', payload);
                const jwtToken = jsonwebtoken.sign(payload, jwtKey);

                res.status(200).json({message:'user logged in successfully', payload: payload, token: jwtToken});
            }
        });


    } catch(err){
        next(err)
    }
        
});

app.post('/tweets', authMiddleware, async(req: Request, res: Response, next: NextFunction) => {
    try{
        const username: string = res.locals?.username;
        const userId: number = res.locals?.userId;

        //validate everything
        const tweetContent: string = req.body.content?.trim();
        if(!tweetContent){
            console.error('tweet failed, empty tweet');
            return res.status(400).json({error:'cannot make tweet, content is empty'});
        }

        if(tweetContent.length > 250){
            console.error('tweet failed, more than 250 chars');
            return res.status(400).json({error:'cannot make tweet, content should be atmost 250 characters'});
        }

        const tweetId: string = getRandomId();

        db.run(`
        INSERT INTO tweets (user_id, content, tweet_id) VALUES (?, ?, ?)
        `, [userId, tweetContent, tweetId], (err) => {
            if(err){
                console.error('cannot make tweet', err.message);
                return res.status(500).json({error: 'cannot make tweet, something went wrong'});
            }
            console.log('a tweet was created by', username);
            res.status(201).json({message: 'tweet created', userId: userId, tweet: req.body.content, tweetId: tweetId});
        })
        //add better validators later
        //gotta put in database as well
    } catch(err){
        next(err)
    }
});

app.get('/tweets/:userId', async(req: Request, res: Response, next: NextFunction) =>{
    try{
        const userId: string = req.params.userId;
        db.get(`
            SELECT username, password FROM users WHERE user_id = ?
        `, [userId], (err: any, row: any)=>{
            if(err){
                console.error('cannot get user for tweet lookup', err.message);
                return res.status(500).json({error:'something went wrong while getting user for tweets lookup'});
            }

            if(!row){
                console.error('no such user found for tweet lookup');
                return res.status(404).json({error:'no such user found'});
            }
        });

        db.all(`
                SELECT * FROM tweets WHERE user_id = ?
        `, [userId], (err, rows)=>{
            if(err){
                console.error('cannot get tweets for tweet lookup', err.message);
                return res.status(500).json({error:'something went wrong while getting tweets for tweets lookup'});
            }

            if(!rows){
                console.error('user has no tweets');
                return res.status(404).json({error:'no tweets found by the user'});
            }

            console.log('tweets by user:', rows);
            res.status(200).json({message:'tweets found', tweets:rows});
        });
    } catch(err){
        throw(err);
    }
});


//take care of the database closure 