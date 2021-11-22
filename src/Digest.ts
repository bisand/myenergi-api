import * as https from 'https';
import { RequestOptions } from 'https';
import * as url from "url";
import { AuthDigest } from './AuthDigest';

export class Digest {
    private _authorization?: AuthDigest;

    constructor(username: string, password: string) {
        this._authorization = new AuthDigest(username, password);
    }

    private request(options: RequestOptions, data?: any, retryCount: number = 0): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let resData: string = '';
            if (!options.headers)
                options.headers = {};
            options.headers.Authorization = this._authorization?.getAuthorization(options.method as string, options.path as string);
            const req = https.request(options, (res: any) => {

                if (res.statusCode == 401) {
                    if (retryCount > 1) {
                        reject("Authentication failed");
                        return;
                    }
                    retryCount++;
                    let auth = res.headers["www-authenticate"];
                    this._authorization?.init(auth);
                    if (!options.headers)
                        options.headers = {};
                    options.headers.Authorization = this._authorization?.getAuthorization(options.method as string, options.path as string);
                    return this.request(options, data, retryCount).then(value => {
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
        const uri = url.parse(requestUrl, true);
        const options: RequestOptions = {
            hostname: uri.hostname,
            port: uri.port,
            path: uri.pathname,
            method: 'GET',
            headers: {
                'Connection': 'Keep-Alive',
                'Content-Type': 'application/json',
                'Host': uri.hostname as string,
            }
        };
        return this.request(options, data);
    }

}
