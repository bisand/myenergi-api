import { IncomingMessage } from "http";
import * as https from "https";
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
    };

    private _accessToken?: string;
    private _refreshToken?: string;
    private _expiresAt = 0;

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

    private async call(method: string, path: string, retry = true): Promise<unknown> {
        const token = await this.getAccessToken();
        const res = await this.request(method, new URL(path, this._config.base_url), { Authorization: `Bearer ${token}`, Accept: "application/json" });
        if (res.statusCode == 401 && retry) {
            // The token was rejected before its expiry time. Sign in again.
            this._accessToken = undefined;
            this._refreshToken = undefined;
            return this.call(method, path, false);
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
            if (this._refreshToken) {
                try {
                    await this.authenticate("REFRESH_TOKEN_AUTH", { REFRESH_TOKEN: this._refreshToken });
                } catch (error) {
                    this._refreshToken = undefined;
                    await this.login();
                }
            } else {
                await this.login();
            }
        }
        return this._accessToken as string;
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
