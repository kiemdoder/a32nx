import { EFB_CHANGE_BATTERY_LEVEL } from '../actions';

export const changeEfbBatteryLevel = (levelDelta: number) => ({
    type: EFB_CHANGE_BATTERY_LEVEL,
    levelDelta,
});
