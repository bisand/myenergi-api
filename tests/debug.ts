import { exit } from 'process';
import { MyEnergi } from '../src';
import * as dotenv from 'dotenv';
import { Zappi } from '../src/models/Zappi';
import { EddiBoost, EddiMode, ZappiBoostMode, ZappiChargeMode } from '../src/models/Types';

dotenv.config();

const runner = new Promise<any>(async (resolve, reject) => {
    const myenergi = new MyEnergi(process.env.USERNAME as string, process.env.PASSWORD as string);

    const statusAll = await myenergi.getStatusAll()
    console.log(statusAll);

    const zappiAll = await myenergi.getStatusZappiAll();
    console.log(zappiAll);

    let sno: string = zappiAll[0].sno;
    const chargeMode = await myenergi.setZappiChargeMode(sno, ZappiChargeMode.Fast);
    console.log(chargeMode);

    const boostMode = await myenergi.setZappiBoostMode(sno, ZappiBoostMode.Stop);
    console.log(boostMode);

    const greenLevel = await myenergi.setZappiGreenLevel(sno, 0);
    console.log(greenLevel);

    const statusZappi = await myenergi.getStatusZappi(sno);
    console.log(statusZappi);

    const harviAll = await myenergi.getStatusHarviAll();
    console.log(harviAll);

    if (harviAll[0]) {
        sno = harviAll[0].sno;
        const statusHarvi = await myenergi.getStatusHarvi(sno);
        console.log(statusHarvi);
    }
    const eddiAll = await myenergi.getStatusEddiAll();
    console.log(eddiAll);

    if (eddiAll[0]) {
        sno = eddiAll[0].sno;
        const statusEddi = await myenergi.getStatusEddi(sno);
        console.log(statusEddi);
    }

    // Just for testing. Not valid serial!
    await myenergi.setEddiMode('10088888', EddiMode.On);
    await myenergi.setEddiBoost('10088888', EddiBoost.ManualHeater1, 10);
    resolve('OK');
});

runner.then(x => {
    console.log(x);
    exit();
});
