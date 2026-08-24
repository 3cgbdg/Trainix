import { combineReducers, configureStore, type UnknownAction } from "@reduxjs/toolkit";
import authReducer, { logOut } from "./authSlice"
import workoutsReducer from "./workoutsSlice"
import nutritionDayReducer from "./nutritionDaySlice"
import measurementReducer from "./measurementSlice"
const appReducer = combineReducers({
    auth: authReducer,
    workouts: workoutsReducer,
    nutritionDay: nutritionDayReducer,
    measurements: measurementReducer,
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: UnknownAction) =>
    appReducer(action.type === logOut.type ? undefined : state, action);

export const store = configureStore({ reducer: rootReducer });


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;
