export interface Zappi {
    /**
     * Zappi Serial number
     * 
     * @type {string}
     */
    sno: string;
    /**
     * Current Date
     * 
     * @type {string}
     */
    dat: string;
    /**
     * Current Time
     * 
     * @type {string}
     */
    tim: string;
    /**
     * Physical CT connection 1 value Watts
     * 
     * @type {number}
     */
    ectp1: number;
    /**
     * Physical CT connection 2 value Watts
     * 
     * @type {number}
     */
    ectp2: number;
    /**
     * Physical CT connection 3 value Watts
     * 
     * @type {number}
     */
    ectp3: number;
    /**
     * Physical CT connection 4 value Watts
     * 
     * @type {number}
     */
    ectp4: number;
    /**
     * Physical CT connection 5 value Watts
     * 
     * @type {number}
     */
    ectp5: number;
    /**
     * Physical CT connection 6 value Watts
     * 
     * @type {number}
     */
    ectp6: number;
    /**
     * CT 1 Name
     * 
     * @type {string}
     */
    ectt1: string;
    /**
     * CT 2 Name
     * 
     * @type {string}
     */
    ectt2: string;
    /**
     * CT 3 Name
     * 
     * @type {string}
     */
    ectt3: string;
    /**
     * CT 4 Name
     * 
     * @type {string}
     */
    ectt4: string;
    /**
     * CT 5 Name
     * 
     * @type {string}
     */
    ectt5: string;
    /**
     * CT 6 Name
     * 
     * @type {string}
     */
    ectt6: string;
    /**
     * Command Timer - 
     * 
     *      counts 1 - 10 when command sent
     * Then:
     * 
     *      254 - success, 
     *      253 - failure, 
     *      255 - never received any comamnds
     * 
     * @type {number}
     */
    cmt: number;
    /**
     * Use Daylight Savings Time
     * 
     * @type {number}
     */
    dst: number;
    /**
     * Diversion amount Watts (does not appear if zero)
     * 
     * @type {number}
     */
    div: number;
    /**
     * Supply Frequency
     * 
     * @type {number}
     */
    frq: number;
    /**
     * Firmware Version
     * 
     * @type {number}
     */
    fwv: string;
    /**
     * Generated Watts
     * 
     * @type {number}
     */
    gen: number;
    /**
     * Watts from grid?
     * 
     * @type {number}
     */
    grd: number;
    /**
     * Minimum Green Level
     * 
     * @type {number}
     */
    mgl: number;
    /**
     * Number of Phases in the installation
     * 
     * @type {number}
     */
    pha: number;
    /**
     * priority
     * 
     * @type {number}
     */
    pri: number;
    /**
     * Status
     * 
     *      1 = Paused,
     *      3 = Diverting/Charging,
     *      5 = Complete
     * 
     * @type {number}
     */
    sta: number;
    /**
     * Timezone?
     * 
     * @type {number}
     */
    tz: number;
    /**
     * Voltage
     * 
     * @type {number}
     */
    vol: number;
    /**
     * Lates charge session. Charge added in KWh
     * 
     * @type {number}
     */
    che: number;
    /**
     * Lock Status
     * 
     *      4 bits
     *      1st digit - ?,
     *      2nd digit - 1 unlocked, 0 locked
     * 
     * @type {number}
     */
    lck: number;
    /**
     * Charger Status
     * 
     *      A = EV Disconnected,
     *      B1 = EV Connected,
     *      B2 = Waiting for EV,
     *      C1 = EV Ready to Charge,
     *      C2 = Charging,
     *      F = Fault
     * 
     * @type {string}
     */
    pst: string;
    /**
     * Boost Mode. 
     *
     *      1 = ON
     *      0 = OFF
     *
     * @example
     * // Logic for selecting MANUAL or SMART
     * if (tbh !== undefined && bsm === 1) 
     *   MANUAL
     * else
     *   SMART
     * 
     * @type {number}
     */
    bsm: number;
    bst: number;
    bss: number;
    /**
     * Smart Boost Start Time Hour
     * 
     * @type {number}
     */
    sbh: number;
    /**
     * Smart Boost KWh to add
     * 
     * @type {number}
     */
    sbk: number;
    /**
     * Smart Boost Start Time Minute
     * 
     * @type {number}
     */
    sbm: number;
    /**
     * boost hour?
     * 
     * @type {number}
     */
    tbh: number;
    /**
     * boost KWh
     * 
     * Note charge remaining for boost = tbk-che
     * 
     * @type {number}
     */
    tbk: number;
    /**
     * boost minute?
     * @type {number}
     */
    tbm: number;
    /**
     * Zappi Charge Mode
     * 
     *      1 = Fast
     *      2 = Eco
     *      3 = Eco+
     *      4 = Stopped
     * 
     * @type {number}
     */
    zmo: number;
    rdc: number;
    rac: number;
    rrac: number;
    zs: number;
    zsl: number;
}
