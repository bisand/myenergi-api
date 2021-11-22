import { Digest } from './Digest';

export class MyEnergi {
    private _config = {
        username: '',
        password: '',
        eddi_url: 'https://s18.myenergi.net/cgi-jstatus-E',
        zappi_url: 'https://s18.myenergi.net/cgi-jstatus-Z',
        harvi_url: 'https://s18.myenergi.net/cgi-jstatus-H',
        status_url: 'https://s18.myenergi.net/cgi-jstatus-*',
        dayhour_url: 'https://s18.myenergi.net/cgi-jdayhour-'
        //https://s18.myenergi.net/cgi-jdayhour-Znnnnnnnn-YYYY-MM-DD
    }
    private _client: any;
    private _asn: any;

    constructor(username: string, password: string) {
        this._config.username = username;
        this._config.password = password;
    }

    public async getStatus(): Promise<any> {
        const digest = new Digest(this._config.username, this._config.password);
        const data = await digest.get(this._config.status_url);
        return data;
    }
}
