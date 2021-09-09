import { EFB_SET_BATTERY_LEVEL } from '../actions';

export const setEfbBatteryLevel = (level: number) => ({
    type: EFB_SET_BATTERY_LEVEL,
    level,
});
