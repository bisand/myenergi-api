import * as https from "https";
import { RequestOptions } from "https";
import * as url from "url";
import { AuthDigest } from "./AuthDigest";

export class Digest {
    private _authDigest?: AuthDigest;
    private _baseUrl: url.Url;
    private _maxRedirectCount: number;
    private _maxRetryCount: number;

    constructor(baseUrl: string, username: string, password: string) {
        this._maxRedirectCount = 3
        this._maxRetryCount = 2
        this._baseUrl = url.parse(baseUrl, true);
        this._authDigest = new AuthDigest(username, password, (err) => {
            console.error(err);
        });
    }

    private request(options: RequestOptions, data?: any, retryCount: number = 0, redirectCount: number = 0): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let resData: string = "";
            if (!options.headers) options.headers = {};
            options.headers.Authorization = this._authDigest?.getAuthorization(options.method as string, options.path as string);
            const req = https.request(options, (res: any) => {
                if (res.statusCode == 401) {
                    // myenergi asn redirect handler.
                    const myenergiAsn = res.headers["x_myenergi-asn"];
                    if (myenergiAsn && myenergiAsn !== "undefined" && myenergiAsn !== this._baseUrl.host) {
                        if (redirectCount > this._maxRedirectCount) {
                            reject(`Too many redirects: ${myenergiAsn}`);
                            return;
                        }
                        this._baseUrl.host = myenergiAsn;
                        this._baseUrl.hostname = myenergiAsn;
                        options.host = myenergiAsn;
                        options.hostname = myenergiAsn;
                        redirectCount++;
                        return this.request(options, data, retryCount, redirectCount)
                            .then((value) => {
                                resolve(value);
                            })
                            .catch((resaon) => {
                                reject(resaon);
                            });
                    }
                    if (retryCount > this._maxRetryCount) {
                        reject("Authentication failed");
                        return;
                    }
                    retryCount++;
                    const wwwAuth = res.headers["www-authenticate"] as string;
                    if (!wwwAuth.startsWith("Digest")) {
                        reject("Unsupported authentication method. Supported authentication schemes: Digest");
                        return;
                    }
                    this._authDigest?.init(wwwAuth);
                    if (!options.headers) options.headers = {};
                    options.headers.Authorization = this._authDigest?.getAuthorization(options.method as string, options.path as string);
                    return this.request(options, data, retryCount)
                        .then((value) => {
                            resolve(value);
                        })
                        .catch((resaon) => {
                            reject(resaon);
                        });
                } else if (res.statusCode >= 200 && res.statusCode < 300) {
                    // myenergi asn redirect handler.
                    const myenergiAsn = res.headers["x_myenergi-asn"];
                    if (myenergiAsn && myenergiAsn !== "undefined" && myenergiAsn !== this._baseUrl.host) {
                        if (redirectCount > this._maxRedirectCount) {
                            reject(`Too many redirects: ${myenergiAsn}`);
                            return;
                        }
                        this._baseUrl.host = myenergiAsn;
                        this._baseUrl.hostname = myenergiAsn;
                        options.host = myenergiAsn;
                        options.hostname = myenergiAsn;
                        redirectCount++;
                        return this.request(options, data, retryCount, redirectCount)
                            .then((value) => {
                                resolve(value);
                            })
                            .catch((resaon) => {
                                reject(resaon);
                            });
                    }
                    // Plain 200 handling
                    res.setEncoding("utf8");
                    res.on("data", (chunk: string) => {
                        resData += chunk;
                    });
                    res.on("end", () => {
                        resolve(resData);
                    });
                } else if (res.statusCode >= 300 && res.statusCode < 400) {
                    if (redirectCount > this._maxRedirectCount) {
                        reject(`Too many redirects: ${res.headers["location"]}`);
                        return;
                    }
                    const location = res.headers["location"] as string;
                    const uri = url.parse(location, true);
                    if (uri.host !== this._baseUrl.host) {
                        this._baseUrl.host = uri.host;
                    }
                    redirectCount++;
                    return this.request(options, data, retryCount, redirectCount)
                        .then((value) => {
                            resolve(value);
                        })
                        .catch((resaon) => {
                            reject(resaon);
                        });
                } else {
                    console.error("status code failed!!");
                    reject("status code failed!!");
                    return;
                }
            });

            req.on("error", (e: any) => {
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
            hostname: this._baseUrl.hostname,
            host: this._baseUrl.host,
            port: this._baseUrl.port,
            path: uri.path,
            method: "GET",
            headers: {
                Connection: "Keep-Alive",
                "Content-Type": "application/json",
                Accept: "application/json",
                Host: uri.hostname as string,
            },
        };
        return this.request(options, data);
    }
}
