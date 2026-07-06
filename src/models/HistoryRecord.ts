/**
 * One row of historic telemetry from cgi-jdayhour (hourly) or cgi-jday /
 * cgi-jhour (per minute). All energy values are in joules (watt seconds) -
 * divide by 3600000 for kWh. Fields with value zero are omitted by the
 * server, so all fields are optional.
 */
export interface HistoryRecord {
    /** Minute (omitted on hourly records and when 0) */
    min?: number;
    /** Hour of day (UTC) */
    hr?: number;
    /** Day of week, three letter code e.g. "Mon" */
    dow?: string;
    /** Day of month */
    dom?: number;
    /** Month of year */
    mon?: number;
    /** Year (4 digits) */
    yr?: number;
    /** Imported energy (joules) */
    imp?: number;
    /** Exported energy (joules) */
    exp?: number;
    /** Positive generation energy (joules) */
    gep?: number;
    /** Negative generation energy (joules) */
    gen?: number;
    /** Energy diverted to heater/EV 1 (joules) */
    h1d?: number;
    /** Energy boosted to heater/EV 1 (joules) */
    h1b?: number;
    /** Energy diverted to heater/EV 2 (joules) */
    h2d?: number;
    /** Energy boosted to heater/EV 2 (joules) */
    h2b?: number;
    /** Energy diverted to heater/EV 3 (joules) */
    h3d?: number;
    /** Energy boosted to heater/EV 3 (joules) */
    h3b?: number;
    /** External CT 1-3 positive/negative energy (joules) */
    pect1?: number;
    nect1?: number;
    pect2?: number;
    nect2?: number;
    pect3?: number;
    nect3?: number;
    /** Voltage phase 1 (0.1 V) */
    v1?: number;
    /** Mains frequency (0.01 Hz) */
    frq?: number;
    /** Pilot state (Zappi) */
    pst?: string;
}
