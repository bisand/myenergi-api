export enum EddiBoost {
    CancelHeater1 = '1-1',
    CancelHeater2 = '1-1',
    CancelRelay1 = '1-11',
    CancelRelay2 = '1-12',
    ManualHeater1 = '10-1',
    ManualHeater2 = '10-1',
    ManualRelay1 = '10-11',
    ManualRelay2 = '10-12',
}

export enum EddiHeaterStatus {
    Paused = 1,
    Diverting = 3,
    Boost = 4,
    MaxTempReached = 5,
    Stopped = 6,
}

export enum EddiMode {
    Off = 0,
    On = 1,
}

export enum ZappiBoostMode {
    Manual = 10,
    Smart = 11,
    Stop = 2,
}

export enum ZappiChargeMode {
    Off = 4,
    Fast = 1,
    Eco = 2,
    EcoPlus = 3,
}
