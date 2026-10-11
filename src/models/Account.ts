/**
 * Models for the myenergi account API (myaccount.myenergi.com). The API is
 * not officially documented, so only the commonly used fields are listed
 * and responses may contain more.
 */

export interface AccountHub {
    hubId: string; // account id of the hub, used by the schedule and tariff calls
    hubName: string;
    serialNo: string;
    hubPassword: string; // the API key used by the MyEnergi class
    locationId: string;
    locationName: string;
    isVHub: boolean;
    server: string;
    devices: string[];
}

export interface AccountDevice {
    id: string; // account id of the device, used by the schedule calls
    deviceName: string;
    deviceType: string; // e.g. "zappi", "eddi", "harvi", "libbi"
    serialNumber: string;
    firmware: string;
    status: number;
    locationId?: string;
}

export interface AccountHubsAndDevices {
    hubs: { hub: { id: string; serialNo: string; nickName: string; firmware: string; isVHub: boolean }; deviceIds: string[]; locationId: string }[];
    devices: { device: AccountDevice; locationId: string; isVHub: boolean }[];
    offlineDevices: unknown[];
}

export interface AccountLocation {
    address: { id: string; siteName: string; countryCode: string; currency: string; [key: string]: unknown };
    energySetup: { id: string; energyProvider: string; energyTariff: string; tariffFriendlyName: string; isEconomy: boolean; isActive: boolean; [key: string]: unknown };
    isGuestLocation: boolean;
    invitationData?: { invitationId: string; [key: string]: unknown };
    ownerEmail: string;
}

export interface AccountVehicle {
    id: string;
    manufacturer: string;
    model: string;
    batterySize: number; // kWh
    chargeRate: number; // kW
    manufacturingYear?: number;
    ownership?: number;
}

/**
 * A charge schedule entry as returned by the API. Dates are returned as
 * MM/DD/YYYY, but must be sent as DD-MM-YYYY.
 */
export interface ChargeSchedule {
    id?: string;
    scheduleType: string; // "Single", ...
    scheduleNickName: string;
    chargingOutputName: string; // vehicle profile id
    chargeAmountMinutes: number;
    chargeAmountKWh: number;
    fromTime: string; // HH:MM
    toTime: string; // HH:MM
    singleChargeDay?: string;
    isActive?: boolean;
    [key: string]: unknown;
}

export interface DeviceChargeSchedules {
    deviceId: string;
    deviceName: string;
    deviceType: string;
    firmware: string;
    scheduleCharges: ChargeSchedule[];
    scheduleChargesActive: boolean;
    budgetCharges: ChargeSchedule[];
    budgetChargesActive: boolean;
    singleCharges: ChargeSchedule[];
    singleChargesActive: boolean;
}

export interface HubChargeSchedules {
    hubId: string;
    hubNickName: string;
    energySetupProvider: string;
    energySetupTarrif: string;
    isEconomy: boolean;
    isGuestUser: boolean;
    devices: DeviceChargeSchedules[];
}

/**
 * A one-off, date-specific charge. myenergi picks the cheapest times
 * between fromTime and toTime from the tariff set on the account.
 */
export interface ZappiSingleCharge {
    name: string; // 1-24 characters
    vehicleId: string; // vehicle profile id, see getVehicles
    kWh: number; // energy to add, at least 1
    date: Date | string; // day of the charge; a string must be DD-MM-YYYY
    fromTime: string; // HH:MM
    toTime: string; // HH:MM
}

export interface TariffBand {
    id?: string;
    fromMinutes: number; // minutes after midnight
    toMinutes: number;
    price: number;
}

export interface DualTariff {
    energySetupId: string;
    days: number[]; // 0-6
    tariffs: TariffBand[];
}
