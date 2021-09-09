import typeToReducer from 'type-to-reducer';
import { EFB_BATTERY_REDUCER } from '..';

interface EfbBatteryState {
    level: number;
}

const initialState: EfbBatteryState = { level: 55 };

export const efbBatteryReducer = typeToReducer({
    [EFB_BATTERY_REDUCER]: (state, { level }) => ({
        ...state,
        level,
    }),
},
initialState);
