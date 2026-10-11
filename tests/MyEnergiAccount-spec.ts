import nock from "nock";
import { MyEnergiAccount, MyEnergiAccountError } from "../src/MyEnergiAccount";

describe("MyEnergiAccount Tests", () => {
    const accountUrl = "https://account.test.com";
    const authUrl = "https://auth.test.com/";
    const authTarget = { reqheaders: { "x-amz-target": "AWSCognitoIdentityProviderService.InitiateAuth" } };
    const passwordAuth = { AuthFlow: "USER_PASSWORD_AUTH", AuthParameters: { USERNAME: "me@test.com", PASSWORD: "pwd" }, ClientId: /.+/ };

    const mockLogin = (token = "token1", expiresIn = 3600) =>
        nock("https://auth.test.com", authTarget)
            .post("/", passwordAuth)
            .reply(200, { AuthenticationResult: { AccessToken: token, ExpiresIn: expiresIn, RefreshToken: "refresh1", TokenType: "Bearer" } });

    const account = () => new MyEnergiAccount("me@test.com", "pwd", accountUrl, authUrl);

    afterEach(() => {
        expect(nock.isDone()).toBe(true);
        nock.cleanAll();
    });

    it("Should get Libbi charge from grid", async () => {
        mockLogin();
        nock(accountUrl, { reqheaders: { authorization: "Bearer token1" } })
            .get("/api/AccountAccess/LibbiMode?serialNo=21234567")
            .reply(200, { status: true, message: "", field: "", content: { "21234567": true } });

        expect(await account().getLibbiChargeFromGrid("21234567")).toBe(true);
    });

    it("Should set Libbi charge from grid and reuse the token", async () => {
        mockLogin();
        nock(accountUrl, { reqheaders: { authorization: "Bearer token1" } })
            .put("/api/AccountAccess/LibbiMode?chargeFromGrid=true&serialNo=21234567")
            .reply(200, { status: true, message: "", field: "", content: "Libbi mode flag successfully updated!" })
            .put("/api/AccountAccess/LibbiMode?chargeFromGrid=false&serialNo=21234567")
            .reply(200, { status: true, message: "", field: "", content: "Libbi mode flag successfully updated!" });

        const client = account();
        await client.setLibbiChargeFromGrid("21234567", true);
        await client.setLibbiChargeFromGrid("21234567", false);
    });

    it("Should get Libbi charge setup", async () => {
        mockLogin();
        nock(accountUrl)
            .get("/api/AccountAccess/21234567/LibbiChargeSetup")
            .reply(200, { status: true, message: "", field: "", content: { deviceSerial: "21234567", chargeFromGrid: false, energyTarget: 5520 } });

        expect(await account().getLibbiChargeSetup("21234567")).toEqual({ deviceSerial: "21234567", chargeFromGrid: false, energyTarget: 5520 });
    });

    it("Should set Libbi charge target", async () => {
        mockLogin();
        nock(accountUrl)
            .put("/api/AccountAccess/21234567/TargetEnergy?targetEnergy=4600")
            .reply(200, { status: true, message: "", field: "", content: "" });

        await account().setLibbiChargeTarget("21234567", 4600.4);
    });

    it("Should refresh an expired token", async () => {
        // Expires immediately because of the one minute renewal margin.
        mockLogin("token1", 60);
        nock("https://auth.test.com", authTarget)
            .post("/", { AuthFlow: "REFRESH_TOKEN_AUTH", AuthParameters: { REFRESH_TOKEN: "refresh1" }, ClientId: /.+/ })
            .reply(200, { AuthenticationResult: { AccessToken: "token2", ExpiresIn: 3600 } });
        nock(accountUrl, { reqheaders: { authorization: "Bearer token1" } })
            .get("/api/AccountAccess/LibbiMode?serialNo=21234567")
            .reply(200, { status: true, content: { "21234567": false } });
        nock(accountUrl, { reqheaders: { authorization: "Bearer token2" } })
            .get("/api/AccountAccess/LibbiMode?serialNo=21234567")
            .reply(200, { status: true, content: { "21234567": true } });

        const client = account();
        expect(await client.getLibbiChargeFromGrid("21234567")).toBe(false);
        expect(await client.getLibbiChargeFromGrid("21234567")).toBe(true);
    });

    it("Should sign in again when the token is rejected", async () => {
        mockLogin("token1");
        mockLogin("token2");
        nock(accountUrl, { reqheaders: { authorization: "Bearer token1" } })
            .get("/api/AccountAccess/LibbiMode?serialNo=21234567")
            .reply(401);
        nock(accountUrl, { reqheaders: { authorization: "Bearer token2" } })
            .get("/api/AccountAccess/LibbiMode?serialNo=21234567")
            .reply(200, { status: true, content: { "21234567": true } });

        expect(await account().getLibbiChargeFromGrid("21234567")).toBe(true);
    });

    it("Should fail on wrong credentials", async () => {
        nock("https://auth.test.com")
            .post("/")
            .reply(400, { __type: "NotAuthorizedException", message: "Incorrect username or password." });

        const error = await account().login().catch((e) => e);
        expect(error).toBeInstanceOf(MyEnergiAccountError);
        expect(error.authFailed).toBe(true);
        expect(error.message).toBe("Incorrect username or password.");
    });

    it("Should fail when the account has no access to the device", async () => {
        mockLogin();
        nock(accountUrl)
            .put("/api/AccountAccess/LibbiMode?chargeFromGrid=true&serialNo=21234567")
            .reply(400, { status: false, message: "Device not found or user does not have access to it!", field: "" });

        const error = await account().setLibbiChargeFromGrid("21234567", true).catch((e) => e);
        expect(error).toBeInstanceOf(MyEnergiAccountError);
        expect(error.authFailed).toBe(false);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Device not found or user does not have access to it!");
    });
});
