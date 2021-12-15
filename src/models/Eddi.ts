export interface Eddi {
    sno: string; // Changed Eddi Serial Number
    bsm: number; // Boost Mode - 1 if boosting
    che: number; // total kWh tranferred this session (today?)
    cmt: number; // Command Timer - counts 1 - 10 when command sent, then 254 - success, 253 - failure, 255 - never received any commands
    dat: string; // date
    div: number; // Diversion amount Watts
    dst: number; // Daylight Savings Time enabled
    ectp1: number; // physical CT connection 1 value
    ectp2: number; // physical CT connection 2 value
    ectt1: string; // CT 1 name
    ectt2: string; // CT 2 name
    frq: number; // Supply Frequency
    fwv: number; // firmware version
    gen: number; // Generated Watts
    grd: number; // Current Watts from Grid (negative if sending to grid)
    hno: number; // Currently active heater (1/2)
    ht1: string; // Heater 1 name
    ht2: string; // Heater 2 name
    pha: number; // phase number or number of phases?
    pri: number; // priority
    r1a: number; // Have never seen this ?
    r2a: number; // Have never seen this  ?
    r2b: number; // Have never seen this  ?
    rbt: number; // If boosting, the remaining boost time in of seconds
    sta: number; // Status 1=Paused, 3=Diverting, 4=Boost, 5=Max Temp Reached, 6=Stopped
    tim: string; // time
    tp: number; // temperature probe 1 (50 C)
    tp2: number; // temperature probe 2
    vol: number; // Voltage out (divide by 10)
}
