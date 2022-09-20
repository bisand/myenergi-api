import { MyEnergi } from "../src/MyEnergi";
import nock from "nock";
import { Zappi } from "../src/models/Zappi";

describe("MyEnergi Tests", () => {
    beforeAll(() => {});
    afterAll(() => {});
    beforeEach(() => {});

    let zappiResponse = {
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
        const response: Zappi = Object.assign<Zappi, any>({} as Zappi, zappiResponse.zappi[0]);
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
        const scope1 = nock("https://test.com")
            .defaultReplyHeaders({ "www-authenticate": "Digest realm=Example", "x_myenergi-asn": "login.com" })
            .get("/cgi-jstatus-Z")
            .times(1)
            .reply(401);

        const scope2 = nock("https://login.com")
            .get("/cgi-jstatus-Z")
            .times(1)
            .reply(503);

        const query = new MyEnergi("test", "pwd", "https://test.com");

        const res = await query.getStatusZappi("12345678");
        expect(res).toBeNull();
        nock.cleanAll();
    }, 60000);
});
