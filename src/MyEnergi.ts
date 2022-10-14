/* eslint-disable @typescript-eslint/no-explicit-any */
import { Digest } from "./Digest";
import { AppKeyValues } from './models/AppKeyValues';
import { Eddi } from "./models/Eddi";
import { Harvi } from "./models/Harvi";
import { KeyValue } from './models/KeyValue';
import { EddiBoost, EddiMode, ZappiBoostMode, ZappiChargeMode } from "./models/Types";
import { Zappi } from "./models/Zappi";

export class MyEnergi {
    private _config = {
        username: "",
        password: "",
        base_url: "https://s18.myenergi.net",
        eddi_url: "/cgi-jstatus-E",
        zappi_url: "/cgi-jstatus-Z",
        harvi_url: "/cgi-jstatus-H",
        status_url: "/cgi-jstatus-*",
        dayhour_url: "/cgi-jdayhour-",
        zappi_mode_url: "/cgi-zappi-mode-Z",
        zappi_min_green_url: "/cgi-set-min-green-Z",
        eddi_mode_url: "/cgi-eddi-mode-E",
        eddi_boost_url: "/cgi-eddi-boost-E",
        get_app_key_url: "/cgi-get-app-key",
        set_app_key_url: "/cgi-set-app-key",
        //https://s18.myenergi.net/cgi-jdayhour-Znnnnnnnn-YYYY-MM-DD
    };

    private _digest: Digest;

    constructor(username: string, password: string, apiBaseUrl?: string) {
        this._config.username = username;
        this._config.password = password;
        if (apiBaseUrl)
            this._config.base_url = apiBaseUrl;
        this._digest = new Digest(this._config.base_url, this._config.username, this._config.password);
    }

    public async getStatusAll(): Promise<any> {
        try {
            const data = await this._digest.get(new URL(this._config.status_url, this._config.base_url)) as string;
            const jsonData = JSON.parse(data);
            return jsonData;
        } catch (error) {
            return [];
        }
    }

    public async getStatusZappiAll(): Promise<Zappi[]> {
        try {
            const data = await this._digest.get(new URL(this._config.zappi_url, this._config.base_url)) as string;
            const jsonData = JSON.parse(data);
            if (jsonData.zappi) return Object.assign<Zappi[], unknown>([] as Zappi[], jsonData.zappi);
            else return [] as Zappi[];

        } catch (error) {
            return [] as Zappi[];
        }
    }

    public async getStatusZappi(serialNumber: string): Promise<Zappi | null> {
        try {
            const data = await this._digest.get(new URL(this._config.zappi_url, this._config.base_url)) as string;
            const jsonData = JSON.parse(data);
            if (jsonData.zappi) {
                const zappi = (Object.assign<Zappi[], unknown>([] as Zappi[], jsonData.zappi) as Zappi[]).find((zappi) => {
                    return zappi.sno == serialNumber;
                });
                if (zappi) return Object.assign<Zappi, unknown>({} as Zappi, zappi);
                else return null;
            } else return null;
        } catch (error) {
            return null;
        }
    }

    public async setZappiChargeMode(serialNo: string, chargeMode: ZappiChargeMode): Promise<any> {
        try {
            const url = new URL(`${this._config.zappi_mode_url}${serialNo}-${chargeMode}-0-0-0000`, this._config.base_url);
            const data = await this._digest.get(url);
            const jsonData = JSON.parse(data);
            return jsonData;
        } catch (error) {
            return {};
        }
    }

    public async setZappiBoostMode(serialNo: string, boostMode: ZappiBoostMode, kwh = 0, completeTime = "0000"): Promise<any> {
        try {
            if (boostMode === ZappiBoostMode.Stop) {
                kwh = 0;
                completeTime = "0000";
            }
            const url = new URL(`${this._config.zappi_mode_url}${serialNo}-0-${boostMode}-${kwh}-${completeTime}`, this._config.base_url);
            const data = await this._digest.get(url);
            const jsonData = JSON.parse(data);
            return jsonData;
        } catch (error) {
            return {};
        }
    }

    public async setZappiGreenLevel(serialNo: string, percentage: number): Promise<any> {
        try {
            const url = new URL(`${this._config.zappi_min_green_url}${serialNo}-${percentage}`, this._config.base_url);
            const data = await this._digest.get(url);
            const jsonData = JSON.parse(data);
            return jsonData;
        } catch (error) {
            return {};
        }
    }

    public async getStatusEddiAll(): Promise<Eddi[]> {
        try {
            const data = await this._digest.get(new URL(this._config.eddi_url, this._config.base_url));
            const jsonData = JSON.parse(data);
            if (jsonData.eddi) return Object.assign<Eddi[], unknown>([] as Eddi[], jsonData.eddi);
            else return [] as Eddi[];
        } catch (error) {
            return [] as Eddi[];
        }
    }

    public async getStatusEddi(serialNumber: string): Promise<Eddi | null> {
        try {
            const data = await this._digest.get(new URL(this._config.eddi_url, this._config.base_url));
            const jsonData = JSON.parse(data);
            if (jsonData.eddi) {
                const eddi = (Object.assign<Eddi[], unknown>([] as Eddi[], jsonData.eddi) as Eddi[]).find((eddi) => {
                    return eddi.sno == serialNumber;
                });
                if (eddi) return Object.assign<Eddi, unknown>({} as Eddi, eddi);
                else return null;
            } else return null;
        } catch (error) {
            return null;
        }
    }

    public async setEddiMode(serialNo: string, mode: EddiMode): Promise<any> {
        try {
            const url = new URL(`${this._config.eddi_mode_url}${serialNo}-${mode}`, this._config.base_url);
            const data = await this._digest.get(url);
            const jsonData = JSON.parse(data);
            return jsonData;
        } catch (error) {
            return {};
        }
    }

    public async setEddiBoost(serialNo: string, boost: EddiBoost, minutes = 0): Promise<any> {
        try {
            const url = new URL(`${this._config.eddi_boost_url}${serialNo}-${boost}-${minutes}`, this._config.base_url);
            const data = await this._digest.get(url);
            const jsonData = JSON.parse(data);
            return jsonData;
        } catch (error) {
            return {};
        }
    }

    public async getStatusHarviAll(): Promise<Harvi[]> {
        try {
            const data = await this._digest.get(new URL(this._config.harvi_url, this._config.base_url));
            const jsonData = JSON.parse(data);
            if (jsonData.harvi) return Object.assign<Harvi[], unknown>([] as Harvi[], jsonData.harvi);
            else return [] as Harvi[];
        } catch (error) {
            return [] as Harvi[];
        }
    }

    public async getStatusHarvi(serialNumber: string): Promise<Harvi | null> {
        try {
            const data = await this._digest.get(new URL(this._config.harvi_url, this._config.base_url));
            const jsonData = JSON.parse(data);
            if (jsonData.harvi) {
                const harvi = (Object.assign<Harvi[], unknown>([] as Harvi[], jsonData.harvi) as Harvi[]).find((harvi) => {
                    return harvi.sno == serialNumber;
                });
                if (harvi) return Object.assign<Harvi, unknown>({} as Harvi, harvi);
                else return null;
            } else return null;
        } catch (error) {
            return null;
        }
    }

    public async getAppKeyFull(key: string): Promise<AppKeyValues | null> {
        try {
            const data = await this._digest.get(new URL(`${this._config.get_app_key_url}-${key}`, this._config.base_url));
            const jsonData = JSON.parse(data);
            if (jsonData) {
                const result = Object.assign<AppKeyValues, unknown>({} as AppKeyValues, jsonData);
                return result;
            }
        } catch (error) {
            return null;
        }
        return null;
    }

    public async getAppKey(key: string): Promise<KeyValue[] | null> {
        try {
            const data = await this._digest.get(new URL(`${this._config.get_app_key_url}-${key}`, this._config.base_url));
            const jsonData = JSON.parse(data);
            if (jsonData) {
                const result = Object.assign<AppKeyValues, unknown>({} as AppKeyValues, jsonData);
                if (result[Object.keys(result)[0]])
                    return result[Object.keys(result)[0]];
            }
        } catch (error) {
            return null;
        }
        return null;
    }

    public async setAppKey(key: string, val: string): Promise<KeyValue[] | null> {
        try {
            const data = await this._digest.get(new URL(`${this._config.set_app_key_url}-${key}=${val}`, this._config.base_url));
            const jsonData = JSON.parse(data);
            if (jsonData) {
                const result = Object.assign<AppKeyValues, unknown>({} as AppKeyValues, jsonData);
                if (result[Object.keys(result)[0]])
                    return result[Object.keys(result)[0]];
            }
        } catch (error) {
            return null;
        }
        return null;
    }
}
