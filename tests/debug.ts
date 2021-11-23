import { exit } from 'process';
import { MyEnergi } from '../src';
import * as dotenv from 'dotenv';
import { ZappiBoostMode, ZappiChargeMode } from '../src/MyEnergi';
import { Zappi } from '../src/models/Zappi';

dotenv.config();

const runner = new Promise<Zappi>(async (resolve, reject) => {
    const myenergi = new MyEnergi(process.env.USERNAME as string, process.env.PASSWORD as string);
    const statusAll = await myenergi.getStatusAll()
    console.log(statusAll);
    const zappiAll = await myenergi.getStatusZappiAll();
    console.log(zappiAll);
    const sno: string = zappiAll[0].sno;
    const chargeMode = await myenergi.setZappiChargeMode(sno, ZappiChargeMode.Fast);
    console.log(chargeMode);
    const boostMode = await myenergi.setZappiBoostMode(sno, ZappiBoostMode.Stop);
    console.log(boostMode);
    const greenLevel = await myenergi.setZappiGreenLevel(sno, 0);
    console.log(greenLevel);
    const statusZappi = await myenergi.getStatusZappi(sno);
    resolve(statusZappi);
});

runner.then(x => {
    console.log(x);
    exit();
});
