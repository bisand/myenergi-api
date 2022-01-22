import { exit } from "process";
import {
    MyEnergi,
    Zappi,
    ZappiBoostMode,
    ZappiChargeMode,
    EddiBoost,
    EddiMode,
} from "../src";
import * as dotenv from "dotenv";

dotenv.config();

const runner = new Promise<any>(async (resolve, reject) => {
    const myenergi = new MyEnergi(process.env.USERNAME as string, process.env.PASSWORD as string);

    const statusAll = await myenergi.getStatusAll();
    console.log(statusAll);

    const zappiAll: Zappi[] = await myenergi.getStatusZappiAll();
    console.log(zappiAll);

    if (zappiAll[0]) {
        let sno: string = zappiAll[0].sno;
        const statusZappi: Zappi = await myenergi.getStatusZappi(sno);
        console.log(statusZappi);

        const chargeMode = await myenergi.setZappiChargeMode(sno, ZappiChargeMode.EcoPlus);
        console.log(chargeMode);

        const greenLevel = await myenergi.setZappiGreenLevel(sno, 75);
        console.log(greenLevel);

        const boostMode = await myenergi.setZappiBoostMode(sno, ZappiBoostMode.Smart, 22, '0615');
        console.log(boostMode);
    }

    const harviAll = await myenergi.getStatusHarviAll();
    console.log(harviAll);

    if (harviAll[0]) {
        const sno = harviAll[0].sno;
        const statusHarvi = await myenergi.getStatusHarvi(sno);
        console.log(statusHarvi);
    }
    const eddiAll = await myenergi.getStatusEddiAll();
    console.log(eddiAll);

    if (eddiAll[0]) {
        const sno = eddiAll[0].sno;
        const statusEddi = await myenergi.getStatusEddi(sno);
        console.log(statusEddi);
    }

    // Just for testing. Not valid serial!
    await myenergi.setEddiMode("10088888", EddiMode.On);
    await myenergi.setEddiBoost("10088888", EddiBoost.ManualHeater1, 10);
    resolve("OK");
});

runner.then((x) => {
    console.log(x);
    exit();
});
