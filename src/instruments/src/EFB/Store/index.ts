import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import { todCalculatorReducer } from './reducer/tod-calculator.reducer';
import { EFB_CLEAR_STATE } from './actions';
import { buttonsReducer } from './reducer/ground-reducer';
import { efbBatteryReducer } from './reducer/efb-battery-reducer';

export const TOD_CALCULATOR_REDUCER = 'todCalculatorReducer';
export const BUTTON_STATE_REDUCER = 'buttonsReducer';
export const DEADZONE_REDUCER = 'deadZoneReducer';
export const EFB_BATTERY_REDUCER = 'efbBatteryReducer';
export default createStore(
    (state: any, action) => {
        if (action.type === EFB_CLEAR_STATE) {
            state = undefined;
        }

        return combineReducers({
            [TOD_CALCULATOR_REDUCER]: todCalculatorReducer,
            [BUTTON_STATE_REDUCER]: buttonsReducer,
            [EFB_BATTERY_REDUCER]: efbBatteryReducer,
        })(state, action);
    },
    composeWithDevTools(applyMiddleware(thunk)),
);
