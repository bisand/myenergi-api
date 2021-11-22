import { exit } from 'process';
import { MyEnergi } from '../src';
import * as dotenv from 'dotenv';

dotenv.config();
const myenergi = new MyEnergi(process.env.USERNAME as string, process.env.PASSWORD as string);
myenergi.getStatus().then(val => {
    console.log(val);
    exit();
});
