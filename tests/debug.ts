import { exit } from 'process';
import { MyEnergi } from '../src';
import * as dotenv from 'dotenv';
import { ZappiBoostMode, ZappiChargeMode } from '../src/MyEnergi';

dotenv.config();
const myenergi = new MyEnergi(process.env.USERNAME as string, process.env.PASSWORD as string);
myenergi.getStatus().then(val => {
    console.log(val);
    myenergi.getZappi().then(v => {
        console.log(v);
        const sno: string = JSON.parse(v).zappi[0].sno;
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
