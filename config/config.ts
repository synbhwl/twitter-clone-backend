import * as dotenv from 'dotenv';

dotenv.config()
export const port: number = process.env.port ? parseInt(process.env.port) : 8080;
export const jwtKey: any = process.env.JWT_SECRET_KEY;
if(!jwtKey){
    console.error('cannot read JWT key');
}