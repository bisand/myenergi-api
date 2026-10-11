/**
 * Libbi charge from grid setup as reported by the myenergi account API.
 */
export interface LibbiChargeSetup {
    deviceSerial: string;
    chargeFromGrid: boolean; // allowed to charge from the grid
    energyTarget: number; // charge target (Wh)
}
