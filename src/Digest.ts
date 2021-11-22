import * as https from 'https';
import * as crypto from 'crypto';
import { RequestOptions } from 'https';
import * as url from "url";

export class Digest {
    private _username: string;
    private _password: string;
    private _authorization: string | undefined;

    constructor(username: string, password: string) {
        this._username = username;
        this._password = password;
        this._authorization = '';
    }

    private md5(data: string) {
        let md5 = crypto.createHash('md5');
        let result = md5.update(data).digest('hex');
        return result;
    }

    private request(options: RequestOptions, data?: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const req = https.request(options, (res: any) => {
                let resData: string = '';

                res.setEncoding('utf8');
                res.on('data', (chunk: string) => {
                    resData += chunk;
                });
                res.on('end', () => {
                    resolve(resData);
                });
            });

            req.on('error', (e: any) => {
                console.error(`problem with request: ${e.message}`);
                reject(e);
            });

            if (data) {
                req.write(data);
            }

            req.end();
        });
    }

    private requestDigest(options: RequestOptions, data?: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let resData: string = '';
            const req = https.request(options, (res: any) => {

                if (res.statusCode == 401) {
                    let cnonce = this.md5(String(new Date().getTime()));
                    let auth = res.headers["www-authenticate"];
                    let realm, nonce, qop;
                    let authSplit = auth?.split(",") as string[];

                    for (let item of authSplit) {
                        if (item.indexOf("realm=") >= 0) {
                            let realmSplit = item.split("=\"");
                            realm = realmSplit[realmSplit.length - 1];
                            realm = realm.substring(0, realm.length - 1);
                        }

                        if (item.indexOf("nonce=") >= 0) {
                            let nonceSplit = item.split("=\"");
                            nonce = nonceSplit[nonceSplit.length - 1];
                            nonce = nonce.substring(0, nonce.length - 1);
                        }

                        if (item.indexOf("qop=") >= 0) {
                            let qopSplit = item.split("=\"");
                            qop = qopSplit[qopSplit.length - 1];
                            qop = qop.substring(0, qop.length - 1);
                        }
                    }

                    let HA1 = this.md5(this._username + ":" + realm + ":" + this._password);
                    let HA2 = this.md5(options.method + ":" + options.path);
                    let response = this.md5(HA1 + ":" + nonce + ":00000001:" + cnonce + ":" + qop + ":" + HA2);
                    if (!options.headers)
                        options.headers = {};
                    this._authorization = "Digest username=\"" + this._username + "\",realm=\"" + realm + "\",nonce=\"" + nonce + "\",uri=\"" + options.path + "\",cnonce=\"" + cnonce + "\",nc=00000001,algorithm=MD5,response=\"" + response + "\",qop=\"" + qop + "\"";
                    options.headers.Authorization = this._authorization;
                    return this.requestDigest(options, data).then(value => {
                        resolve(value);
                    }).catch(resaon => {
                        reject(resaon);
                    });
                } else if (res.statusCode >= 200 && res.statusCode < 300) {
                    res.setEncoding('utf8');
                    res.on('data', (chunk: string) => {
                        resData += chunk;
                    });
                    res.on('end', () => {
                        resolve(resData);
                    });
                } else {
                    console.error("status code failed!!");
                    reject("status code failed!!");
                    return;
                }
            });

            req.on('error', (e: any) => {
                console.error(`problem with request: ${e.message}`);
                reject(e);
            });

            if (data) {
                req.write(data);
            }

            req.end();
        });
    }

    public get(requestUrl: string, data?: any): Promise<any> {
        const uri = url.parse(requestUrl);
        const options: RequestOptions = {
            hostname: uri.hostname,
            port: uri.port,
            path: uri.pathname,
            method: 'GET',
            headers: {
                'Connection': 'Keep-Alive',
                'Content-Type': 'text/plain',
                'Host': uri.hostname as string,
                'Authorization': this._authorization
            }
        };
        return this.requestDigest(options, data);
    }

}
