import typeToReducer from 'type-to-reducer';
import { EFB_CHANGE_BATTERY_LEVEL } from '../actions';

interface EfbBatteryState {
    batteryLevel: number;
}

const initialState: EfbBatteryState = { batteryLevel: 55 };

export const efbBatteryReducer = typeToReducer({
    [EFB_CHANGE_BATTERY_LEVEL]: (state, { levelDelta }) => ({
        ...state,
        batteryLevel: state.batteryLevel < 100 && state.batteryLevel > 10 ? Math.min(state.batteryLevel + levelDelta, 100) : state.batteryLevel,
    }),
},
initialState);
