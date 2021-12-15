import { Digest } from "./Digest";
import { Eddi } from "./models/Eddi";
import { Harvi } from "./models/Harvi";
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
        //https://s18.myenergi.net/cgi-jdayhour-Znnnnnnnn-YYYY-MM-DD
    };

    private _digest: Digest;

    constructor(username: string, password: string) {
        this._config.username = username;
        this._config.password = password;
        this._digest = new Digest(this._config.base_url, this._config.username, this._config.password);
    }

    public async getStatusAll(): Promise<any> {
        const data = await this._digest.get(this._config.status_url);
        const jsonData = JSON.parse(data);
        return jsonData;
    }

    public async getStatusZappiAll(): Promise<Zappi[]> {
        const data = await this._digest.get(this._config.zappi_url);
        const jsonData = JSON.parse(data);
        if (jsonData.zappi) return Object.assign<Zappi[], any>([] as Zappi[], jsonData.zappi);
        else return [] as Zappi[];
    }

    public async getStatusZappi(serialNumber: string): Promise<Zappi | null> {
        const data = await this._digest.get(this._config.zappi_url);
        const jsonData = JSON.parse(data);
        if (jsonData.zappi) {
            const zappi = (Object.assign<Zappi[], any>([] as Zappi[], jsonData.zappi) as Zappi[]).find((zappi) => {
                return zappi.sno === serialNumber;
            });
            if (zappi) return Object.assign<Zappi, any>({} as Zappi, zappi);
            else return null;
        } else return null;
    }

    public async setZappiChargeMode(serialNo: string, chargeMode: ZappiChargeMode): Promise<any> {
        const url = `${this._config.zappi_mode_url}${serialNo}-${chargeMode}-0-0-0000`;
        const data = await this._digest.get(url);
        const jsonData = JSON.parse(data);
        return jsonData;
    }

    public async setZappiBoostMode(serialNo: string, boostMode: ZappiBoostMode, kwh: number = 0, completeTime: string = "0000"): Promise<any> {
        if (boostMode === ZappiBoostMode.Stop) {
            kwh = 0;
            completeTime = "0000";
        }
        const url = `${this._config.zappi_mode_url}${serialNo}-0-${boostMode}-${kwh}-${completeTime}`;
        const data = await this._digest.get(url);
        const jsonData = JSON.parse(data);
        return jsonData;
    }

    public async setZappiGreenLevel(serialNo: string, percentage: number): Promise<any> {
        const url = `${this._config.zappi_min_green_url}${serialNo}-${percentage}`;
        const data = await this._digest.get(url);
        const jsonData = JSON.parse(data);
        return jsonData;
    }

    public async getStatusEddiAll(): Promise<Eddi[]> {
        const data = await this._digest.get(this._config.eddi_url);
        const jsonData = JSON.parse(data);
        if (jsonData.eddi) return Object.assign<Eddi[], any>([] as Eddi[], jsonData.eddi);
        else return [] as Eddi[];
    }

    public async getStatusEddi(serialNumber: string): Promise<Eddi | null> {
        const data = await this._digest.get(this._config.eddi_url);
        const jsonData = JSON.parse(data);
        if (jsonData.eddi) {
            const eddi = (Object.assign<Eddi[], any>([] as Eddi[], jsonData.eddi) as Eddi[]).find((eddi) => {
                return eddi.sno === serialNumber;
            });
            if (eddi) return Object.assign<Eddi, any>({} as Eddi, eddi);
            else return null;
        } else return null;
    }

    public async setEddiMode(serialNo: string, mode: EddiMode): Promise<any> {
        const url = `${this._config.eddi_mode_url}${serialNo}-${mode}`;
        const data = await this._digest.get(url);
        const jsonData = JSON.parse(data);
        return jsonData;
    }

    public async setEddiBoost(serialNo: string, boost: EddiBoost, minutes: number = 0): Promise<any> {
        const url = `${this._config.eddi_boost_url}${serialNo}-${boost}-${minutes}`;
        const data = await this._digest.get(url);
        const jsonData = JSON.parse(data);
        return jsonData;
    }

    public async getStatusHarviAll(): Promise<Harvi[]> {
        const data = await this._digest.get(this._config.harvi_url);
        const jsonData = JSON.parse(data);
        if (jsonData.harvi) return Object.assign<Harvi[], any>([] as Harvi[], jsonData.harvi);
        else return [] as Harvi[];
    }

    public async getStatusHarvi(serialNumber: string): Promise<Harvi | null> {
        const data = await this._digest.get(this._config.harvi_url);
        const jsonData = JSON.parse(data);
        if (jsonData.harvi) {
            const harvi = (Object.assign<Harvi[], any>([] as Harvi[], jsonData.harvi) as Harvi[]).find((harvi) => {
                return harvi.sno === serialNumber;
            });
            if (harvi) return Object.assign<Harvi, any>({} as Harvi, harvi);
            else return null;
        } else return null;
    }
}
