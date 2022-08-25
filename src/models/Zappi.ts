export interface Zappi {
    /**
     * General documentation
     * 
     * Zappi Charge States
     * 
     *      PST/STA                 0=Starting      1=Waiting for export/Paused 2=DSR                       3=Diverting/Charging    4=Boosting          5=Complete 
     *      
     *      A=EV Disconnected                       Not connected	            Not connected	            Not connected           Not connected	    Not connected
     *      B1=EV Connected                         Waiting for surplus power   Waiting for surplus power                           Waiting for EV      Charge Complete
     *      B2=Waiting for EV                       Charge Delayed	            Charge Delayed                                      Charge Delayed      Charge Complete
     *      C1=EV Ready to charge                   Waiting for surplus power   Waiting for surplus power                           Boosting            Charge Complete
     *      C2=Charging                             Charging                    Charging	                Charging	            Boosting	
     *      F=Fault/Restart                         Fault / Restarting	        Fault / Restarting	        Fault / Restarting	    Fault / Restarting  Fault / Restarting
     *      
     */

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
     *      0 = Starting
     *      1 = Waiting for export
     *      2 = DSR
     *      3 = Diverting
     *      4 = Boosting
     *      5 = Hot
     *      6 = Stopped
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
     *      4 Bits
     *      Bit 0: Locked Now 
     *      Bit 1: Lock when plugged in 
     *      Bit 2: Lock when unplugged. 
     *      Bit 3: Charge when locked. 
     *      Bit 4: Charge Session Allowed (Even if locked)
     * 
     * @type {number}
     */
    lck: number;

    /**
     * Pilot State
     * 
     *      A = EV Disconnected,
     *      B1 = EV Connected,
     *      B2 = Waiting for EV,
     *      C1 = Charging,
     *      C2 = Charging Max Power,
     *      F = Fault/Restart
     * 
     * @type {string}
     */
    pst: string;

    /**
     * Boost Manual. 
     *
     *      1 = ON
     *      0 = OFF
     *
     * @type {number}
     */
    bsm: number;

    /**
     * Boost Smart. 
     *
     *      1 = ON
     *      0 = OFF
     *
     * @type {number}
     */
    bss: number;

    /**
     * Boost Timed. 
     *
     *      1 = ON
     *      0 = OFF
     *
     * @type {number}
     */
    bst: number;

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

    /**
     *      Error state
     *      Not visible for normal operations it is not shown untill you actualy get a error state
     * 
     *      0	EV_STARTUP 
     *      1	EV_DISC 
     *      2	EV_JUST_DISCONNECTED 
     *      3	EV_CONNECTED_START 
     *      4	EV_CONNECTED 
     *      5	EVSE_SURPLUS_AVAILABLE 
     *      6	EVSE_LOCKED 
     *      7	EVSE_WAIT_FOR_TEMP 
     *      8	EVSE_WAITING_FOR_EV 
     *      9	EV_CHARGE_DELAYED 
     *      10	EV_CHARGE_COMPLETE 
     *      11	EVSE_RCD_CHECK
     *      12	EVSE_CHARGING 
     *      13	EVSE_IMPORTING 
     *      14	EV_CHARGE_STOPPING
     *      15	EV_READY_LEGACY_START 
     *      16	EV_READY_LEGACY 
     *      17	EVSE_WAIT_FOR_LIMIT 
     *      18	EV_VENT 
     *      19	EVSE_RESTARTING 
     *      20	EVSE_PHASE_SWITCHING_RESTART 
     *      21	EV_WRONG_CABLE 
     *      22	EVSE_BAD_PILOT 
     *      23	EVSE_FAULT_LOCK 
     *      24	EVSE_FAULT_OUTPUT 
     *      25	EVSE_FAULT_PE 
     *      26	EVSE_FAULT_COMS 
     *      27	EVSE_SELFTEST_FAILED 
     *      28	EVSE_FAULT_CONTACTOR 
     *      29	EVSE_FAULT_RCD_TRIP 
     *      30	EVSE_FAULT_OVERLOAD 
     *      31	EVSE_FAULT_VOLTAGE_RANGE 
     *      32	EVSE_FAULT_VOLTAGE_MISMATCH 
     *      33	EVSE_WRONG_PHASE_ROTATION 
     *      50	CHARGE_BLOCKED 
     *      51	EV_PRECON 
     *      52	EVSE_PHSW_DELAY 
     *      53	EVSE_CHARGE_STOPPED 
     *
     * @type {number}
     */
    zsh: number;

    /** UNKNOWN */
    rdc: number;
    rac: number;
    rrac: number;
    zs: number;
    zsl: number;
}
