/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { exit } from "process";
import {
    MyEnergi,
    Zappi,
    ZappiBoostMode,
    ZappiChargeMode,
    EddiBoost,
    EddiMode,
} from "./src";
import * as dotenv from "dotenv";

dotenv.config();

const runner = (iterations: number) => new Promise<unknown>(async (resolve, reject) => {

    for (let index = 0; index < iterations; index++) {
        try {
            const myenergi = new MyEnergi(process.env.USERNAME as string, process.env.PASSWORD as string, 'https://s18.myenergi.net');

            const statusAll = await myenergi.getStatusAll();
            console.log(statusAll);

            const zappiAll: Zappi[] = await myenergi.getStatusZappiAll();
            console.log(zappiAll);

            if (zappiAll[0]) {
                const sno: string = zappiAll[0].sno;
                const statusZappi: Zappi | null = await myenergi.getStatusZappi(sno);
                console.log(statusZappi);

                // const chargeMode = await myenergi.setZappiChargeMode(sno, ZappiChargeMode.EcoPlus);
                // console.log(chargeMode);

                // const greenLevel = await myenergi.setZappiGreenLevel(sno, 75);
                // console.log(greenLevel);

                // const boostMode = await myenergi.setZappiBoostMode(sno, ZappiBoostMode.Smart, 22, '0615');
                // console.log(boostMode);
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

            for (const [key,value] of Object.entries(process.memoryUsage())){
                console.log(`Memory usage by ${key}, ${value/1000000}MB `)
            }

        } catch (error) {
            reject(error)
        }
    }

    resolve("OK");
});

runner(100).then((x) => {
    console.log(x);
    exit();
}).catch(console.error);
