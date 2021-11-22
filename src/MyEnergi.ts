import { Digest } from './Digest';

export enum ZappiChargeMode {
    Off = 4,
    Fast = 1,
    Eco = 2,
    EcoPlus = 3
}

export enum ZappiBoostMode {
    Manual = 10,
    Smart = 11,
    Stop = 2
}

export class MyEnergi {
    private _config = {
        username: '',
        password: '',
        eddi_url: 'https://s18.myenergi.net/cgi-jstatus-E',
        zappi_url: 'https://s18.myenergi.net/cgi-jstatus-Z',
        harvi_url: 'https://s18.myenergi.net/cgi-jstatus-H',
        status_url: 'https://s18.myenergi.net/cgi-jstatus-*',
        dayhour_url: 'https://s18.myenergi.net/cgi-jdayhour-',
        zappi_mode_url: 'https://s18.myenergi.net/cgi-zappi-mode-Z',
        zappi_min_green_url: 'https://s18.myenergi.net/cgi-set-min-green-Z'
        //https://s18.myenergi.net/cgi-jdayhour-Znnnnnnnn-YYYY-MM-DD
    }

    private _digest: Digest;

    constructor(username: string, password: string) {
        this._config.username = username;
        this._config.password = password;
        this._digest = new Digest(this._config.username, this._config.password);
    }

    public async getStatus(): Promise<any> {
        const data = await this._digest.get(this._config.status_url);
        return data;
    }

    public async getZappi(): Promise<any> {
        const data = await this._digest.get(this._config.zappi_url);
        return data;
    }

    public async setZappiChargeMode(serialNo: string, chargeMode: ZappiChargeMode): Promise<any> {
        const url = `${this._config.zappi_mode_url}${serialNo}-${chargeMode}-0-0-0000`;
        const data = await this._digest.get(url);
        return data;
    }

    public async setZappiBoostMode(serialNo: string, boostMode: ZappiBoostMode, kwh: number = 0, completeTime: string = '0000'): Promise<any> {
        if (boostMode === ZappiBoostMode.Stop) {
            kwh = 0;
            completeTime = '0000';
        }
        const url = `${this._config.zappi_mode_url}${serialNo}-0-${boostMode}-${kwh}-${completeTime}`;
        const data = await this._digest.get(url);
        return data;
    }

    public async setZappiGreenLevel(serialNo: string, percentage: number): Promise<any> {
        const url = `${this._config.zappi_min_green_url}${serialNo}-${percentage}`;
        const data = await this._digest.get(url);
        return data;
    }

}
