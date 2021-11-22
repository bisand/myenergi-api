import { Digest } from './Digest';

export enum ZappiChargeMode {
    Off = 4,
    Fast = 1,
    Eco = 2,
    EcoPlus = 3
}
export enum ZappiBoostMode {
    Fast = 0,
    Eco = 1,
    EcoPlus = 2
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
        zappi_mode_url: 'https://s18.myenergi.net/cgi-zappi-mode-Z'
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

}
