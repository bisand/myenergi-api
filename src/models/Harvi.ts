export interface Harvi {
    sno: string; // Harvi serial no
    dat: string; // Date
    tim: string; // Time
    ectp1: number; // Physical CT connection 1 value Watts
    ectp2: number; // Physical CT connection 2 value Watts
    ectp3: number; // Physical CT connection 3 value Watts
    ectt1: string; // CT 1 Name
    ectt2: string; // CT 2 Name
    ectt3: string; // CT 3 Name
    ect1p: number; // CT 1 Phase
    ect2p: number; // CT 2 Phase
    ect3p: number; // CT 3 Phase
    fwv: string; // Firmware version
}
