/**
 * Status data for a myenergi Libbi home battery as reported by
 * cgi-jstatus-L. Zero-valued fields are omitted by the server.
 */
export interface Libbi {
    sno: string;
    dat: string;
    tim: string;
    ectp1: number; // physical CT connection 1 value (Watts)
    ectp2: number;
    ectp3: number;
    ectp4: number;
    ectp5: number;
    ectp6: number;
    ectt1: string; // CT 1 type
    ectt2: string;
    ectt3: string;
    ectt4: string;
    ectt5: string;
    ectt6: string;
    cmt: number; // command tries
    dst: number; // daylight savings time
    div: number; // diverted (load) power Watts
    frq: number; // frequency
    fwv: string; // firmware version
    gen: number; // generated power Watts (built-in inverter)
    grd: number; // grid power Watts
    pha: number; // phase
    pri: number; // priority
    sta: number; // state (see Libbi state codes)
    soc: number; // state of charge percent
    lmo: string | number; // Libbi mode, e.g. "BALANCE"/"STOP"/"DRAIN" or numeric
    mbc: number; // max battery capacity (Wh)
    mic: number; // max inverter capacity (Wh)
    che: number; // charge energy this session (kWh)
    tz: number;
    vol: number; // voltage (0.1 V)
    bdb?: number; // battery discharge boost
    newAppAvailable?: boolean;
    newBootloaderAvailable?: boolean;
    batteryDischargeEnabled?: boolean;
}
