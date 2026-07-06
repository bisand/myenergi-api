/* eslint-disable @typescript-eslint/no-empty-function */
import { MyEnergi } from "../src/MyEnergi";
import { EddiBoost, LibbiMode, ZappiPhaseSetting } from "../src/models/Types";
import nock from "nock";
import { Zappi } from "../src/models/Zappi";
import { AppKeyValues } from '../src/models/AppKeyValues';
import { KeyValue } from '../src/models/KeyValue';

describe("MyEnergi Tests", () => {
    beforeAll(() => { });
    afterAll(() => { });
    beforeEach(() => { });

    const zappiResponse = {
        zappi: [
            {
                sno: 12345678,
                dat: "19-09-2022",
                tim: "19:38:37",
                ectp2: -10,
                ectp3: -2,
                ectt1: "Internal Load",
                ectt2: "None",
                ectt3: "None",
                bsm: 0,
                bst: 0,
                cmt: 255,
                dst: 1,
                div: 0,
                frq: 49.97,
                fwv: "3300S0.000",
                grd: 86,
                pha: 1,
                pri: 1,
                sta: 1,
                tz: 0,
                vol: 2359,
                che: 47.36,
                bss: 0,
                lck: 0,
                pst: "A",
                zmo: 1,
                zs: 20,
                rdc: 3,
                rac: 1,
                rrac: 2,
                zsl: 20,
                ectt4: "None",
                ectt5: "None",
                ectt6: "None",
                mgl: 84,
                sbh: 6,
                sbk: 22,
                sbm: 15,
            },
        ],
    };

    const keyValueResponse = {
        "H12345678": [{ key: "Z1234567", val: "Zappi" }]
    }

    const keyValueSetResponse = {
        "H12345678": [{ key: "Z1234567", val: "Zappi123" }]
    }

    it("should be able to test", () => {
        expect(true).toBeTruthy();
    });

    it("should be able to create instance", () => {
        const myenergi = new MyEnergi("test", "pwd");
        expect(myenergi).toBeInstanceOf(MyEnergi);
    });

    it("Should return a valid Zappi device", async () => {
        nock("https://test.com")
            .defaultReplyHeaders({ "www-authenticate": "Digest realm=Example" })
            .get("/cgi-jstatus-Z")
            .reply(200, zappiResponse);
        const query = new MyEnergi("test", "pwd", "https://test.com");

        const res = await query.getStatusZappi("12345678");
        const response: Zappi = Object.assign<Zappi, unknown>({} as Zappi, zappiResponse.zappi[0]);
        expect(res).toMatchObject(response);
        nock.cleanAll();
    }, 60000);

    it("Should NOT throw an error on 'Too many redirects'", async () => {
        nock("https://test.com")
            .defaultReplyHeaders({ "www-authenticate": "Digest realm=Example", "x_myenergi-asn": "login.com" })
            .get("/cgi-jstatus-Z")
            .times(5)
            .reply(401);

        nock("https://login.com")
            .defaultReplyHeaders({ "www-authenticate": "Digest realm=Example", "x_myenergi-asn": "test.com" })
            .get("/cgi-jstatus-Z")
            .times(5)
            .reply(401);

        const query = new MyEnergi("test", "pwd", "https://test.com");

        const res = await query.getStatusZappi("12345678");
        expect(res).toBeNull();
        nock.cleanAll();
    }, 60000);

    it("Should NOT throw an error on HTTP response 503", async () => {
        nock("https://test.com")
            .defaultReplyHeaders({ "www-authenticate": "Digest realm=Example", "x_myenergi-asn": "login.com" })
            .get("/cgi-jstatus-Z")
            .times(1)
            .reply(503);

        const query = new MyEnergi("test", "pwd", "https://test.com");

        const res = await query.getStatusZappi("12345678");
        expect(res).toBeNull();
        nock.cleanAll();
    }, 60000);

    it("Should NOT throw an error on HTTP response 503 from redirect", async () => {
        nock("https://test.com")
            .defaultReplyHeaders({ "www-authenticate": "Digest realm=Example", "x_myenergi-asn": "login.com" })
            .get("/cgi-jstatus-Z")
            .times(1)
            .reply(401);

        nock("https://login.com")
            .get("/cgi-jstatus-Z")
            .times(1)
            .reply(503);

        const query = new MyEnergi("test", "pwd", "https://test.com");

        const res = await query.getStatusZappi("12345678");
        expect(res).toBeNull();
        nock.cleanAll();
    }, 60000);

    it("Should return valid app key values", async () => {
        nock("https://test.com")
            .defaultReplyHeaders({ "www-authenticate": "Digest realm=Example" })
            .get("/cgi-get-app-key-Z1234567")
            .reply(200, keyValueResponse);

        const query = new MyEnergi("test", "pwd", "https://test.com");

        const res = await query.getAppKey("Z1234567");
        const response: AppKeyValues = Object.assign<AppKeyValues, unknown>({} as AppKeyValues, keyValueResponse);
        const testResponse: KeyValue[] = response[Object.keys(response)[0]];
        expect(res).toMatchObject(testResponse);
        nock.cleanAll();
    }, 60000);

    it("Should return valid full app key values", async () => {
        nock("https://test.com")
            .defaultReplyHeaders({ "www-authenticate": "Digest realm=Example" })
            .get("/cgi-get-app-key-Z1234567")
            .reply(200, keyValueResponse);

        const query = new MyEnergi("test", "pwd", "https://test.com");

        const res = await query.getAppKeyFull("Z1234567");
        const response: AppKeyValues = Object.assign<AppKeyValues, unknown>({} as AppKeyValues, keyValueResponse);
        expect(res).toMatchObject(response);
        nock.cleanAll();
    }, 60000);

    it("Should set App value and return same App key values", async () => {
        nock("https://test.com")
            .defaultReplyHeaders({ "www-authenticate": "Digest realm=Example" })
            .get("/cgi-set-app-key-Z1234567=Zappi123")
            .reply(200, keyValueSetResponse);

        nock("https://test.com")
            .defaultReplyHeaders({ "www-authenticate": "Digest realm=Example" })
            .get("/cgi-get-app-key-Z1234567")
            .reply(200, keyValueSetResponse);

        const query = new MyEnergi("test", "pwd", "https://test.com");

        const res = await query.setAppKey("Z1234567", "Zappi123");
        const response: AppKeyValues = Object.assign<AppKeyValues, unknown>({} as AppKeyValues, keyValueSetResponse);
        const testResponse: KeyValue[] = response[Object.keys(response)[0]];
        expect(res).toMatchObject(testResponse);
        expect(testResponse[0].val).toMatch("Zappi123");
        nock.cleanAll();
    }, 60000);

    it("Should return day hour history records", async () => {
        const historyResponse = {
            "U12345678": [
                { hr: 6, dow: "Mon", dom: 31, mon: 7, yr: 2023, imp: 3600000, h1d: 1800000 },
                { hr: 7, dow: "Mon", dom: 31, mon: 7, yr: 2023, imp: 7200000, h1d: 3600000, h1b: 900000 },
            ],
        };
        nock("https://test.com")
            .defaultReplyHeaders({ "www-authenticate": "Digest realm=Example" })
            .get("/cgi-jdayhour-Z12345678-2023-7-31-6-2")
            .reply(200, historyResponse);

        const query = new MyEnergi("test", "pwd", "https://test.com");

        const res = await query.getDayHourHistory("Z12345678", 2023, 7, 31, 6, 2);
        expect(res).toHaveLength(2);
        expect(res[0].h1d).toBe(1800000);
        expect(res[1].h1b).toBe(900000);
        nock.cleanAll();
    }, 60000);

    it("Should set Zappi phase setting", async () => {
        nock("https://test.com")
            .defaultReplyHeaders({ "www-authenticate": "Digest realm=Example" })
            .get("/cgi-zappi-phase-setting-Z12345678-2")
            .reply(200, { status: 0, statustext: "" });

        const query = new MyEnergi("test", "pwd", "https://test.com");

        const res = await query.setZappiPhaseSetting("12345678", ZappiPhaseSetting.Auto);
        expect(res).toMatchObject({ status: 0, statustext: "" });
        nock.cleanAll();
    }, 60000);

    it("Should start Eddi manual boost on heater 2", async () => {
        nock("https://test.com")
            .defaultReplyHeaders({ "www-authenticate": "Digest realm=Example" })
            .get("/cgi-eddi-boost-E12345678-10-2-60")
            .reply(200, { status: 0, statustext: "" });

        const query = new MyEnergi("test", "pwd", "https://test.com");

        const res = await query.setEddiBoost("12345678", EddiBoost.ManualHeater2, 60);
        expect(res).toMatchObject({ status: 0, statustext: "" });
        nock.cleanAll();
    }, 60000);

    it("Should cancel Eddi boost on heater 2", async () => {
        nock("https://test.com")
            .defaultReplyHeaders({ "www-authenticate": "Digest realm=Example" })
            .get("/cgi-eddi-boost-E12345678-1-2-0")
            .reply(200, { status: 0, statustext: "" });

        const query = new MyEnergi("test", "pwd", "https://test.com");

        const res = await query.setEddiBoost("12345678", EddiBoost.CancelHeater2);
        expect(res).toMatchObject({ status: 0, statustext: "" });
        nock.cleanAll();
    }, 60000);

    it("Should return a valid Libbi device", async () => {
        const libbiResponse = {
            libbi: [
                { sno: 21234567, dat: "01-07-2026", tim: "12:00:00", soc: 72, gen: 3200, grd: -150, sta: 5, lmo: "BALANCE", mbc: 10200, mic: 5000, frq: 50.01, vol: 2331, pri: 1, cmt: 254 },
            ],
        };
        nock("https://test.com")
            .defaultReplyHeaders({ "www-authenticate": "Digest realm=Example" })
            .get("/cgi-jstatus-L")
            .reply(200, libbiResponse);
        const query = new MyEnergi("test", "pwd", "https://test.com");

        const res = await query.getStatusLibbi("21234567");
        expect(res?.soc).toBe(72);
        expect(res?.gen).toBe(3200);
        nock.cleanAll();
    }, 60000);

    it("Should set Libbi mode", async () => {
        nock("https://test.com")
            .defaultReplyHeaders({ "www-authenticate": "Digest realm=Example" })
            .get("/cgi-libbi-mode-L21234567-1")
            .reply(200, { status: 0, statustext: "" });

        const query = new MyEnergi("test", "pwd", "https://test.com");

        const res = await query.setLibbiMode("21234567", LibbiMode.Normal);
        expect(res).toMatchObject({ status: 0, statustext: "" });
        nock.cleanAll();
    }, 60000);


});
