import { Request, Response, NextFunction } from 'express';
import jsonwebtoken, { Jwt, JwtPayload } from 'jsonwebtoken';
import { jwtKey } from '../config/config';

export function authMiddleware(req: Request, res: Response, next: NextFunction){
    //add more checks later like bearer etc 
    const authHeaders: string | undefined = req.headers?.['authorization'];
    if(authHeaders == null){
        console.error("No auth header was found");
        return res.status(401).json({error:'cannot log in, missing auth header'});
    }
    const token: string = authHeaders.split(' ')[1];
    if(token == null){
        console.error("cannot log in token is empty");
        return res.status(401).json({error:'cannot log in, missing bearer token'});
    };

    

    jsonwebtoken.verify(token, jwtKey, (err: jsonwebtoken.JsonWebTokenError | null, payload: unknown) => {
        if(err){
            console.error('cannot log in, invalid token error', err.message);
            return res.status(403).json({ message: 'Forbidden: Invalid token.' });
        }

        const decoded = payload as JwtPayload;

        // console.log(decoded);

        if (!decoded || !decoded.userId) {
            return res.status(403).json({ message: 'Forbidden: Invalid token payload.' });
          }


        res.locals.username = decoded?.username;
        res.locals.userId = decoded?.userId;

        next();
    });
};