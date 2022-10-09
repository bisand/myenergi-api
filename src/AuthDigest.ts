import * as crypto from "crypto";

export class AuthDigest {
    private _password?: string | undefined;
    private _username?: string | undefined;
    private _initialized: boolean;
    private _onError?: (errorMessage: string) => void;

    public get username(): string | undefined {
        return this._username;
    }
    private _realm?: string | undefined;
    public get realm(): string | undefined {
        return this._realm;
    }
    private _nonce?: string | undefined;
    public get nonce(): string | undefined {
        return this._nonce;
    }
    private _uri?: string | undefined;
    public get uri(): string | undefined {
        return this._uri;
    }
    private _algorithm: string;
    public get algorithm(): string {
        return this._algorithm;
    }
    private _response?: string | undefined;
    public get response(): string | undefined {
        return this._response;
    }
    private _opaque?: string | undefined;
    public get opaque(): string | undefined {
        return this._opaque;
    }
    private _qop?: string | undefined;
    public get qop(): string | undefined {
        return this._qop;
    }
    private _nc: number;
    public get nc(): string | undefined {
        this._nc++;
        const myHex = ("0000000" + this._nc?.toString(16)).substr(-8);
        return myHex;
    }
    private _cnonce?: string | undefined;
    public get cnonce(): string | undefined {
        this._cnonce = this.md5(String(new Date().getTime()));
        return this._cnonce;
    }

    private md5(data: string) {
        const md5 = crypto.createHash("md5");
        const result = md5.update(data).digest("hex");
        return result;
    }

    constructor(username: string, password: string, errorHandler?: (errorMessage: string) => void) {
        this._username = username;
        this._password = password;
        this._nc = 0;
        this._initialized = false;
        this._algorithm = "MD5";
        if (errorHandler) this._onError = errorHandler;
    }

    public init(wwwAuthHeader: string) {

        if (!wwwAuthHeader)
            return;

        const authSplit = wwwAuthHeader.split(",") as string[];

        for (const item of authSplit) {
            if (item && item.indexOf("realm=") >= 0) {
                const realmSplit = item.split('="');
                this._realm = realmSplit[realmSplit.length - 1];
                this._realm = this._realm.substring(0, this._realm.length - 1);
            }

            if (item && item.indexOf("nonce=") >= 0) {
                const nonceSplit = item.split('="');
                this._nonce = nonceSplit[nonceSplit.length - 1];
                this._nonce = this._nonce.substring(0, this._nonce.length - 1);
            }

            if (item && item.indexOf("qop=") >= 0) {
                const qopSplit = item.split('="');
                this._qop = qopSplit[qopSplit.length - 1];
                this._qop = this._qop.substring(0, this._qop.length - 1);
            }

            if (item && item.indexOf("opaque=") >= 0) {
                const opaqueSplit = item.split('="');
                this._opaque = opaqueSplit[opaqueSplit.length - 1];
                this._opaque = this._opaque.substring(0, this._opaque.length - 1);
            }

            if (item && item.indexOf("algorithm=") >= 0) {
                const algorithmSplit = item.split("=");
                this._algorithm = algorithmSplit[algorithmSplit.length - 1];
                this._algorithm = this._algorithm.substring(0, this._algorithm.length);
                if (this._onError && this.algorithm !== "MD5") {
                    this._onError(`Algorithm ${this.algorithm} is not supported. Only MD5 is supportet`);
                }
            }
        }
        this._initialized = true;
    }

    public getAuthorization(httpMethod: string, path: string): string {
        if (!this._initialized) return "";

        const nc = this.nc;
        const cnonce = this.cnonce;
        const HA1 = this.md5(this.username + ":" + this.realm + ":" + this._password);
        const HA2 = this.md5(httpMethod + ":" + path);
        const response = this.md5(HA1 + ":" + this.nonce + ":" + nc + ":" + cnonce + ":" + this.qop + ":" + HA2);

        let res = `Digest username="${this.username}",`;
        res += `realm="${this.realm}",`;
        res += `nonce="${this.nonce}",`;
        res += `uri="${path}",`;
        res += `cnonce="${cnonce}",`;
        res += `nc=${nc},`;
        res += `algorithm=${this.algorithm},`;
        res += `response="${response}",`;
        res += `qop="${this.qop}",`;
        res += `opaque="${this.opaque}"`;
        return res;
    }
}
