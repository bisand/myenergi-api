export interface Zappi {
    sno: string; // Zappi Serial number
    dat: string; // Date
    tim: string; // Time
    ectp1: number; // Physical CT connection 1 value Watts
    ectp2: number; // Physical CT connection 2 value Watts
    ectp3: number; // Physical CT connection 3 value Watts
    ectp4: number; // Physical CT connection 4 value Watts
    ectp5: number; // Physical CT connection 5 value Watts
    ectp6: number; // Physical CT connection 6 value Watts
    ectt1: string; // CT 1 Name
    ectt2: string; // CT 2 Name
    ectt3: string; // CT 3 Name
    ectt4: string; // CT 4 Name
    ectt5: string; // CT 5 Name
    ectt6: string; // CT 6 Name
    cmt: number; // Command Timer- counts 1 - 10 when command sent, then 254 - success, 253 - failure, 255 - never received any comamnds
    dst: number; // Use Daylight Savings Time
    div: number; // Diversion amount Watts (does not appear if zero)
    frq: number; // Supply Frequency
    fwv: string; // Firmware Version
    gen: number; // Generated Watts
    grd: number; // Watts from grid?
    mgl: number; // Minimum Green Level
    pha: number; // Phases
    pri: number; // priority
    sta: number; // Status  1=Paused 3=Diverting/Charging 5=Complete
    tz: number; // Timezone?
    vol: number; // Voltage
    che: number; // Charge added in KWh
    lck: number; // Lock Status (4 bits : 1st digit - ? : 2nd digit - 1 unlocked, 0 locked)
    pst: string; // Status A=EV Disconnected, B1=EV Connected, B2=Waiting for EV, C1=EV Ready to Charge, C2= Charging, F= Fault
    bsm: number;
    bst: number;
    bss: number;
    sbh: number; // Smart Boost Start Time Hour
    sbk: number; // Smart Boost KWh to add
    sbm: number; // Smart Boost Start Time Minute
    tbh: number; // boost hour?
    tbk: number; // boost KWh   - Note charge remaining for boost = tbk-che
    tbm: number; // boost minute?
    zmo: number; // Zappi Mode - 1=Fast, 2=Eco, 3=Eco+, 4=Stopped
    zs: number;
    rdc: number;
    rac: number;
    rrac: number;
    zsl: number;
}
