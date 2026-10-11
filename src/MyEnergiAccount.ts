import { IncomingMessage } from "http";
import * as https from "https";
import { AccountDevice, AccountHub, AccountHubsAndDevices, AccountLocation, AccountVehicle, ChargeSchedule, DeviceChargeSchedules, DualTariff, HubChargeSchedules, ZappiSingleCharge } from "./models/Account";
import { HistoryRecord } from "./models/HistoryRecord";
import { LibbiChargeSetup } from "./models/LibbiChargeSetup";

/**
 * Thrown when the myenergi account API or its login service rejects a
 * request. authFailed is true when the email/password was not accepted.
 */
export class MyEnergiAccountError extends Error {
    public statusCode?: number;
    public authFailed: boolean;

    constructor(message: string, statusCode?: number, authFailed = false) {
        super(message);
        this.name = "MyEnergiAccountError";
        this.statusCode = statusCode;
        this.authFailed = authFailed;
    }
}

interface HttpResponse {
    statusCode: number;
    body: string;
}

/**
 * Client for the myenergi account API (myaccount.myenergi.com). Some
 * features, like Libbi charge from grid, are not available through the
 * hub serial / API key used by the MyEnergi class and require the email
 * and password of the myenergi account instead.
 *
 * Unlike MyEnergi, the methods of this class throw a MyEnergiAccountError
 * when a request fails.
 */
export class MyEnergiAccount {
    private _config = {
        email: "",
        password: "",
        base_url: "https://myaccount.myenergi.com",
        auth_url: "https://cognito-idp.eu-west-2.amazonaws.com/",
        client_id: "2fup0dhufn5vurmprjkj599041",
        libbi_mode_url: "/api/AccountAccess/LibbiMode",
        account_access_url: "/api/AccountAccess/",
        hubs_url: "/api/AccountAccess/Hubs",
        hubs_and_devices_url: "/api/Product/UserHubsAndDevices",
        location_url: "/api/Location",
        vehicles_url: "/api/Vehicle/UserVehicles",
        schedules_url: "/api/ChargeSchedules/GetAllSchedules",
        display_schedules_url: "/api/ChargeSchedules/DisplaySchedules",
        save_schedules_url: "/api/ChargeSchedules/SaveSchedules",
        get_tariff_url: "/api/EnergySetup/GetDualTariffEnergyPrices",
        save_tariff_url: "/api/EnergySetup/SaveDualTariffEnergyPrices",
        hourly_data_url: "/api/Graphs/DevicesOfHubDataHourly",
    };

    /**
     * Set this to act on a location the account was invited to as a guest
     * (see getLocations). It is added to every request.
     */
    public invitationId?: string;

    private _accessToken?: string;
    private _refreshToken?: string;
    private _expiresAt = 0;
    private _signingIn?: Promise<void>;

    constructor(email: string, password: string, accountBaseUrl?: string, authUrl?: string) {
        this._config.email = email;
        this._config.password = password;
        if (accountBaseUrl)
            this._config.base_url = accountBaseUrl;
        if (authUrl)
            this._config.auth_url = authUrl;
    }

    /**
     * Sign in with the account email and password. Called automatically
     * when needed; call it directly to verify the credentials.
     */
    public async login(): Promise<void> {
        await this.authenticate("USER_PASSWORD_AUTH", { USERNAME: this._config.email, PASSWORD: this._config.password });
    }

    /**
     * Whether the Libbi is allowed to charge from the grid.
     */
    public async getLibbiChargeFromGrid(serialNo: string): Promise<boolean> {
        const content = await this.call("GET", `${this._config.libbi_mode_url}?serialNo=${encodeURIComponent(serialNo)}`) as { [key: string]: boolean };
        return !!(content && content[serialNo]);
    }

    /**
     * Allow or disallow the Libbi to charge from the grid. The Libbi only
     * charges from the grid up to its charge target, and only during the
     * cheap periods of the tariff configured in the myenergi app.
     */
    public async setLibbiChargeFromGrid(serialNo: string, chargeFromGrid: boolean): Promise<void> {
        await this.call("PUT", `${this._config.libbi_mode_url}?chargeFromGrid=${chargeFromGrid}&serialNo=${encodeURIComponent(serialNo)}`);
    }

    /**
     * Get the charge from grid setting and the charge target (Wh).
     */
    public async getLibbiChargeSetup(serialNo: string): Promise<LibbiChargeSetup> {
        const content = await this.call("GET", `${this._config.account_access_url}${encodeURIComponent(serialNo)}/LibbiChargeSetup`);
        return Object.assign<LibbiChargeSetup, unknown>({} as LibbiChargeSetup, content);
    }

    /**
     * Set how much energy (Wh) the Libbi should hold when charging from
     * the grid.
     */
    public async setLibbiChargeTarget(serialNo: string, targetEnergyWh: number): Promise<void> {
        await this.call("PUT", `${this._config.account_access_url}${encodeURIComponent(serialNo)}/TargetEnergy?targetEnergy=${Math.round(targetEnergyWh)}`);
    }

    /**
     * The hubs of the account, including each hub's serial number and API
     * key (hubPassword) as used by the MyEnergi class.
     */
    public async getHubs(): Promise<AccountHub[]> {
        const content = await this.call("GET", this._config.hubs_url) as { hubs?: AccountHub[] };
        return (content && content.hubs) || [];
    }

    /**
     * The hubs and devices of the account with their account ids. The
     * schedule calls identify a device by this id, not by its serial number.
     */
    public async getHubsAndDevices(): Promise<AccountHubsAndDevices> {
        return Object.assign<AccountHubsAndDevices, unknown>({ hubs: [], devices: [], offlineDevices: [] }, await this.call("GET", this._config.hubs_and_devices_url));
    }

    /**
     * Find a device of the account by its serial number.
     */
    public async getDevice(serialNo: string): Promise<AccountDevice | null> {
        const { devices } = await this.getHubsAndDevices();
        const found = devices.find((d) => d.device && d.device.serialNumber == serialNo);
        return found ? found.device : null;
    }

    /**
     * The locations (sites) of the account with their address and energy
     * setup. A guest location carries the invitationId to use for it.
     */
    public async getLocations(): Promise<AccountLocation[]> {
        return (await this.call("GET", this._config.location_url) as AccountLocation[]) || [];
    }

    /**
     * The vehicle profiles of the account.
     */
    public async getVehicles(): Promise<AccountVehicle[]> {
        return (await this.call("GET", this._config.vehicles_url) as AccountVehicle[]) || [];
    }

    /**
     * All charge schedules of the account, grouped by hub and device. A
     * hub only lists the devices that support schedules.
     */
    public async getChargeSchedules(): Promise<HubChargeSchedules[]> {
        return (await this.call("GET", this._config.schedules_url) as HubChargeSchedules[]) || [];
    }

    /**
     * The charge schedules of one device, or null when the device does not
     * support schedules.
     * @param deviceId Account id of the device (see getDevice)
     */
    public async getDeviceChargeSchedules(deviceId: string): Promise<DeviceChargeSchedules | null> {
        for (const hub of await this.getChargeSchedules()) {
            const device = (hub.devices || []).find((d) => d.deviceId == deviceId);
            if (device) return device;
        }
        return null;
    }

    /**
     * Whether myenergi has tariff prices for the hub. Single charges are
     * planned from these.
     * @param hubId Account id of the hub (see getHubs)
     */
    public async hasTariffPrices(hubId: string): Promise<boolean> {
        const content = await this.call("GET", `${this._config.display_schedules_url}?hubId=${encodeURIComponent(hubId)}`) as { hasTariffResponse?: boolean };
        return !!(content && content.hasTariffResponse);
    }

    /**
     * Replace all schedules of one type on a device. The API has no call
     * for a single entry: what is sent here becomes the complete list.
     * @param deviceId Account id of the device (see getDevice)
     * @param scheduleType e.g. "Single"
     * @param chargeSchedules The complete list; an entry without id is created
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async saveChargeSchedules(deviceId: string, scheduleType: string, chargeSchedules: any[], isActive = true): Promise<unknown> {
        return this.call("POST", this._config.save_schedules_url, { chargeSchedules, deviceId, isActive, scheduleType });
    }

    /**
     * Add a single charge to a Zappi, keeping the single charges it already
     * has. Returns the response of the save, which holds the saved list.
     * @param deviceId Account id of the Zappi (see getDevice)
     */
    public async addZappiSingleCharge(deviceId: string, charge: ZappiSingleCharge): Promise<unknown> {
        const [device, vehicles] = await Promise.all([this.getDeviceChargeSchedules(deviceId), this.getVehicles()]);
        if (!device)
            throw new MyEnergiAccountError("The device does not support charge schedules.");
        const existing = (device.singleCharges || []).map((c) => this.toSingleChargeRequest(c, vehicles));
        const added = this.toSingleChargeRequest({
            scheduleType: "Single",
            scheduleNickName: charge.name,
            chargingOutputName: charge.vehicleId,
            chargeAmountMinutes: 0,
            chargeAmountKWh: charge.kWh,
            fromTime: charge.fromTime,
            toTime: charge.toTime,
            singleChargeDay: typeof charge.date === "string" ? charge.date : this.formatDay(charge.date),
        }, vehicles);
        return this.saveChargeSchedules(deviceId, "Single", [...existing, added]);
    }

    /**
     * Remove all single charges from a Zappi.
     * @param deviceId Account id of the Zappi (see getDevice)
     */
    public async clearZappiSingleCharges(deviceId: string): Promise<unknown> {
        return this.saveChargeSchedules(deviceId, "Single", []);
    }

    /**
     * The time-of-day tariff bands set on the account for a hub. Empty when
     * the account does not use a manually entered dual tariff.
     * @param hubId Account id of the hub (see getHubs)
     */
    public async getDualTariff(hubId: string): Promise<DualTariff[]> {
        return (await this.call("GET", `${this._config.get_tariff_url}?hubId=${encodeURIComponent(hubId)}`) as DualTariff[]) || [];
    }

    /**
     * Replace the time-of-day tariff bands of the account. This overwrites
     * the tariff set in the myenergi app. Not verified against the live
     * API: the request shape comes from community notes.
     */
    public async saveDualTariff(tariffs: DualTariff[]): Promise<unknown> {
        const body = tariffs.map((t) => ({
            days: t.days,
            energySetupId: t.energySetupId,
            tariffs: t.tariffs.map((b) => ({ fromMinutes: b.fromMinutes, price: b.price, toMinutes: b.toMinutes })),
        }));
        return this.call("POST", this._config.save_tariff_url, body);
    }

    /**
     * Hour by hour history of all devices on a hub, keyed by "U" plus the
     * device serial number. Energy values are in joules (watt seconds).
     * @param hubId Account id of the hub (see getHubs)
     * @param day Start day; its UTC midnight is used
     * @param hours Number of hours to report (default 24, max 744)
     */
    public async getHubHourlyHistory(hubId: string, day: Date, hours = 24): Promise<{ [key: string]: HistoryRecord[] }> {
        const start = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate());
        const content = await this.call("POST", this._config.hourly_data_url, { hubId, dayTimestampsUtc: [start], duration: hours });
        return (content as { [key: string]: HistoryRecord[] }) || {};
    }

    /**
     * Build a single charge as the save call expects it. Saved entries come
     * back without the vehicle and power fields and with the date as
     * MM/DD/YYYY, while the save call needs all of them and DD-MM-YYYY.
     */
    private toSingleChargeRequest(charge: ChargeSchedule, vehicles: AccountVehicle[]): unknown {
        const vehicle = vehicles.find((v) => v.id == charge.chargingOutputName);
        if (!vehicle)
            throw new MyEnergiAccountError(`Unknown vehicle profile: ${charge.chargingOutputName}`);
        const day = `${charge.singleChargeDay || ""}`;
        const usDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(day);
        const request: { [key: string]: unknown } = {
            scheduleNickName: charge.scheduleNickName,
            vehicle: { id: vehicle.id, manufacturer: vehicle.manufacturer, model: vehicle.model, batterySize: vehicle.batterySize, chargeRate: vehicle.chargeRate },
            power: charge.chargeAmountKWh,
            singleChargeDay: usDate ? `${usDate[2]}-${usDate[1]}-${usDate[3]}` : day,
            fromTime: charge.fromTime,
            toTime: charge.toTime,
            chargeAmountMinutes: Math.round(charge.chargeAmountKWh / vehicle.chargeRate * 60),
            chargingOutputName: vehicle.id,
            scheduleType: "Single",
            chargeAmountKWh: charge.chargeAmountKWh,
        };
        if (charge.id)
            request.id = charge.id;
        return request;
    }

    private formatDay(date: Date): string {
        const pad = (n: number) => `${n}`.padStart(2, "0");
        return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
    }

    private async call(method: string, path: string, body?: unknown, retry = true): Promise<unknown> {
        const token = await this.getAccessToken();
        const url = new URL(path, this._config.base_url);
        if (this.invitationId)
            url.searchParams.set("invitationId", this.invitationId);
        const headers: { [key: string]: string } = { Authorization: `Bearer ${token}`, Accept: "application/json" };
        if (body !== undefined)
            headers["Content-Type"] = "application/json";
        const res = await this.request(method, url, headers, body !== undefined ? JSON.stringify(body) : undefined);
        if (res.statusCode == 401 && retry) {
            // The token was rejected before its expiry time. Sign in again.
            this._accessToken = undefined;
            this._refreshToken = undefined;
            return this.call(method, path, body, false);
        }
        let jsonData: { status?: boolean; message?: string; content?: unknown } = {};
        try {
            jsonData = JSON.parse(res.body);
        } catch (error) {
            // Handled below.
        }
        if (res.statusCode < 200 || res.statusCode >= 300 || jsonData.status !== true) {
            throw new MyEnergiAccountError(jsonData.message || `Request failed with status code ${res.statusCode}`, res.statusCode, res.statusCode == 401);
        }
        return jsonData.content;
    }

    private async getAccessToken(): Promise<string> {
        if (!this._accessToken || Date.now() >= this._expiresAt) {
            // Requests made at the same time share one sign in.
            if (!this._signingIn) {
                this._signingIn = this.renewAccessToken().then(
                    () => { this._signingIn = undefined; },
                    (error) => { this._signingIn = undefined; throw error; });
            }
            await this._signingIn;
        }
        return this._accessToken as string;
    }

    private async renewAccessToken(): Promise<void> {
        if (this._refreshToken) {
            try {
                await this.authenticate("REFRESH_TOKEN_AUTH", { REFRESH_TOKEN: this._refreshToken });
                return;
            } catch (error) {
                this._refreshToken = undefined;
            }
        }
        await this.login();
    }

    private async authenticate(authFlow: string, authParameters: { [key: string]: string }): Promise<void> {
        const res = await this.request("POST", new URL(this._config.auth_url), {
            "Content-Type": "application/x-amz-json-1.1",
            "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
        }, JSON.stringify({ AuthFlow: authFlow, AuthParameters: authParameters, ClientId: this._config.client_id }));
        let jsonData: { __type?: string; message?: string; ChallengeName?: string; AuthenticationResult?: { AccessToken: string; ExpiresIn: number; RefreshToken?: string } } = {};
        try {
            jsonData = JSON.parse(res.body);
        } catch (error) {
            // Handled below.
        }
        const result = jsonData.AuthenticationResult;
        if (res.statusCode != 200 || !result || !result.AccessToken) {
            const authFailed = jsonData.__type === "NotAuthorizedException" || jsonData.__type === "UserNotFoundException";
            const message = jsonData.ChallengeName
                ? `Unsupported sign in challenge: ${jsonData.ChallengeName}`
                : jsonData.message || `Sign in failed with status code ${res.statusCode}`;
            throw new MyEnergiAccountError(message, res.statusCode, authFailed);
        }
        this._accessToken = result.AccessToken;
        // Renew a minute early to avoid using a token that is about to expire.
        this._expiresAt = Date.now() + ((result.ExpiresIn || 3600) - 60) * 1000;
        if (result.RefreshToken)
            this._refreshToken = result.RefreshToken;
    }

    private request(method: string, url: URL, headers: { [key: string]: string }, data?: string): Promise<HttpResponse> {
        return new Promise<HttpResponse>((resolve, reject) => {
            if (data !== undefined)
                headers["Content-Length"] = `${Buffer.byteLength(data)}`;
            const req = https.request(url, { method, headers }, (res: IncomingMessage) => {
                let resData = "";
                res.setEncoding("utf8");
                res.on("data", (chunk: string) => {
                    resData += chunk;
                });
                res.on("end", () => {
                    resolve({ statusCode: res.statusCode || 0, body: resData });
                });
            });

            req.setTimeout(20000, () => {
                req.destroy(new Error("Request timed out"));
            });

            req.on("error", (e: Error) => {
                reject(e);
            });

            if (data !== undefined) {
                req.write(data);
            }

            req.end();
        });
    }
}
