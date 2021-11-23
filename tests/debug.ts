import { exit } from 'process';
import { MyEnergi } from '../src';
import * as dotenv from 'dotenv';
import { ZappiBoostMode, ZappiChargeMode } from '../src/MyEnergi';

dotenv.config();
const myenergi = new MyEnergi(process.env.USERNAME as string, process.env.PASSWORD as string);
myenergi.getStatusAll().then(val => {
    console.log(val);
    myenergi.getStatusZappi().then(v => {
        console.log(v);
        const sno: string = v[0].sno;
        myenergi.setZappiChargeMode(sno, ZappiChargeMode.Fast).then(x => {
            console.log(x);
            myenergi.setZappiBoostMode(sno, ZappiBoostMode.Stop).then(x => {
                console.log(x);
                myenergi.setZappiGreenLevel(sno, 0).then(x => {
                    console.log(x);
                    exit();
                }).catch(err => {
                    console.error(err);
                    exit();
                });
            }).catch(err => {
                console.error(err);
                exit();
            });
        }).catch(err => {
            console.error(err);
            exit();
        });
    }).catch(err => {
        console.error(err);
        exit();
    });
}).catch(err => {
    console.error(err);
    exit();
});
