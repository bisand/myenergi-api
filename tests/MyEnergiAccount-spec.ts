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

    const ok = (content: unknown) => ({ status: true, message: "", field: "", content });
    const vehicle = { id: "veh1", manufacturer: "Volkswagen", model: "Other", batterySize: 86, chargeRate: 11 };

    it("Should get hubs", async () => {
        mockLogin();
        nock(accountUrl).get("/api/AccountAccess/Hubs").reply(200, ok({ hubs: [{ hubId: "hub1", serialNo: "12345678", hubPassword: "key" }] }));

        expect(await account().getHubs()).toEqual([{ hubId: "hub1", serialNo: "12345678", hubPassword: "key" }]);
    });

    it("Should find a device by serial number", async () => {
        mockLogin();
        nock(accountUrl).get("/api/Product/UserHubsAndDevices").times(2)
            .reply(200, ok({ hubs: [], devices: [{ device: { id: "dev1", deviceType: "zappi", serialNumber: "10000001" } }], offlineDevices: [] }));

        const client = account();
        expect(await client.getDevice("10000001")).toMatchObject({ id: "dev1", deviceType: "zappi" });
        expect(await client.getDevice("99999999")).toBeNull();
    });

    it("Should get locations and vehicles", async () => {
        mockLogin();
        nock(accountUrl)
            .get("/api/Location").reply(200, ok([{ isGuestLocation: false }]))
            .get("/api/Vehicle/UserVehicles").reply(200, ok([vehicle]));

        const client = account();
        expect(await client.getLocations()).toEqual([{ isGuestLocation: false }]);
        expect(await client.getVehicles()).toEqual([vehicle]);
    });

    it("Should add the invitation id for guest locations", async () => {
        mockLogin();
        nock(accountUrl).get("/api/AccountAccess/LibbiMode?serialNo=21234567&invitationId=inv1").reply(200, ok({ "21234567": true }));

        const client = account();
        client.invitationId = "inv1";
        expect(await client.getLibbiChargeFromGrid("21234567")).toBe(true);
    });

    it("Should get charge schedules of a device", async () => {
        mockLogin();
        nock(accountUrl).get("/api/ChargeSchedules/GetAllSchedules").times(2)
            .reply(200, ok([{ hubId: "hub1", devices: [] }, { hubId: "hub2", devices: [{ deviceId: "dev1", singleCharges: [], singleChargesActive: false }] }]));

        const client = account();
        expect(await client.getDeviceChargeSchedules("dev1")).toMatchObject({ deviceId: "dev1" });
        expect(await client.getDeviceChargeSchedules("dev2")).toBeNull();
    });

    it("Should check for tariff prices", async () => {
        mockLogin();
        nock(accountUrl).get("/api/ChargeSchedules/DisplaySchedules?hubId=hub1").reply(200, ok({ hasTariffResponse: true }));

        expect(await account().hasTariffPrices("hub1")).toBe(true);
    });

    it("Should add a Zappi single charge and keep the existing ones", async () => {
        mockLogin();
        const existing = { id: "sc1", scheduleType: "Single", scheduleNickName: "Existing", chargingOutputName: "veh1", chargeAmountMinutes: 22, fromTime: "01:00", toTime: "05:00", singleChargeDay: "08/27/2026", isActive: true, chargeAmountKWh: 4 };
        nock(accountUrl)
            .get("/api/ChargeSchedules/GetAllSchedules").reply(200, ok([{ hubId: "hub1", devices: [{ deviceId: "dev1", singleCharges: [existing] }] }]))
            .get("/api/Vehicle/UserVehicles").reply(200, ok([vehicle]))
            .post("/api/ChargeSchedules/SaveSchedules", {
                chargeSchedules: [
                    { id: "sc1", scheduleNickName: "Existing", vehicle, power: 4, singleChargeDay: "27-08-2026", fromTime: "01:00", toTime: "05:00", chargeAmountMinutes: 22, chargingOutputName: "veh1", scheduleType: "Single", chargeAmountKWh: 4 },
                    { scheduleNickName: "Homey", vehicle, power: 5, singleChargeDay: "28-08-2026", fromTime: "16:00", toTime: "17:00", chargeAmountMinutes: 27, chargingOutputName: "veh1", scheduleType: "Single", chargeAmountKWh: 5 },
                ],
                deviceId: "dev1",
                isActive: true,
                scheduleType: "Single",
            })
            .reply(200, ok({ chargeSchedules: [] }));

        await account().addZappiSingleCharge("dev1", { name: "Homey", vehicleId: "veh1", kWh: 5, date: new Date(2026, 7, 28), fromTime: "16:00", toTime: "17:00" });
    });

    it("Should not add a single charge to a device without schedules", async () => {
        mockLogin();
        nock(accountUrl)
            .get("/api/ChargeSchedules/GetAllSchedules").reply(200, ok([{ hubId: "hub1", devices: [] }]))
            .get("/api/Vehicle/UserVehicles").reply(200, ok([vehicle]));

        const error = await account().addZappiSingleCharge("dev1", { name: "Homey", vehicleId: "veh1", kWh: 5, date: "28-08-2026", fromTime: "16:00", toTime: "17:00" }).catch((e) => e);
        expect(error).toBeInstanceOf(MyEnergiAccountError);
    });

    it("Should replace and remove a Zappi single charge by name", async () => {
        mockLogin();
        const single = (id: string, name: string, kWh: number) => ({ id, scheduleType: "Single", scheduleNickName: name, chargingOutputName: "veh1", chargeAmountMinutes: 0, fromTime: "01:00", toTime: "05:00", singleChargeDay: "08/27/2026", isActive: true, chargeAmountKWh: kWh });
        const request = (name: string, kWh: number, day: string, id?: string) => ({ ...(id ? { id } : {}), scheduleNickName: name, vehicle, power: kWh, singleChargeDay: day, fromTime: "01:00", toTime: "05:00", chargeAmountMinutes: Math.round(kWh / 11 * 60), chargingOutputName: "veh1", scheduleType: "Single", chargeAmountKWh: kWh });
        nock(accountUrl)
            .get("/api/ChargeSchedules/GetAllSchedules").times(2).reply(200, ok([{ hubId: "hub1", devices: [{ deviceId: "dev1", singleCharges: [single("sc1", "Manual", 4), single("sc2", "Homey", 6)] }] }]))
            .get("/api/Vehicle/UserVehicles").times(2).reply(200, ok([vehicle]))
            .post("/api/ChargeSchedules/SaveSchedules", { chargeSchedules: [request("Manual", 4, "27-08-2026", "sc1"), request("Homey", 11, "28-08-2026")], deviceId: "dev1", isActive: true, scheduleType: "Single" })
            .reply(200, ok({ chargeSchedules: [] }))
            .post("/api/ChargeSchedules/SaveSchedules", { chargeSchedules: [request("Manual", 4, "27-08-2026", "sc1")], deviceId: "dev1", isActive: true, scheduleType: "Single" })
            .reply(200, ok({ chargeSchedules: [] }));

        const client = account();
        await client.setZappiSingleCharge("dev1", { name: "Homey", vehicleId: "veh1", kWh: 11, date: "28-08-2026", fromTime: "01:00", toTime: "05:00" });
        await client.removeZappiSingleCharges("dev1", "Homey");
    });

    it("Should clear Zappi single charges", async () => {
        mockLogin();
        nock(accountUrl)
            .post("/api/ChargeSchedules/SaveSchedules", { chargeSchedules: [], deviceId: "dev1", isActive: true, scheduleType: "Single" })
            .reply(200, ok({ chargeSchedules: [] }));

        await account().clearZappiSingleCharges("dev1");
    });

    it("Should get and save the dual tariff", async () => {
        mockLogin();
        const tariff = { energySetupId: "es1", days: [0, 1, 2, 3, 4, 5, 6], tariffs: [{ id: "t1", fromMinutes: 0, toMinutes: 1440, price: 7.5 }] };
        nock(accountUrl)
            .get("/api/EnergySetup/GetDualTariffEnergyPrices?hubId=hub1").reply(200, ok([tariff]))
            .post("/api/EnergySetup/SaveDualTariffEnergyPrices", [{ days: [0, 1, 2, 3, 4, 5, 6], energySetupId: "es1", tariffs: [{ fromMinutes: 0, price: 7.5, toMinutes: 1440 }] }])
            .reply(200, ok(""));

        const client = account();
        const tariffs = await client.getDualTariff("hub1");
        expect(tariffs).toEqual([tariff]);
        await client.saveDualTariff(tariffs);
    });

    it("Should get hourly history of a hub", async () => {
        mockLogin();
        nock(accountUrl)
            .post("/api/Graphs/DevicesOfHubDataHourly", { hubId: "hub1", dayTimestampsUtc: [Date.UTC(2026, 9, 11)], duration: 24 })
            .reply(200, ok({ U10000001: [{ yr: 2026, mon: 10, dom: 11, imp: 3600000 }] }));

        const history = await account().getHubHourlyHistory("hub1", new Date(Date.UTC(2026, 9, 11, 15)));
        expect(history.U10000001[0].imp).toBe(3600000);
    });
});
