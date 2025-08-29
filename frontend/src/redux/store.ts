import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"
import workoutsReducer from "./workoutsSlice"
import nutritionDayReducer from "./nutritionDaySlice"
import measurementReducer from "./measurementSlice"
export const store = configureStore({
    reducer: {
        auth: authReducer,
        workouts: workoutsReducer,
        nutritionDay: nutritionDayReducer,
        measurements: measurementReducer,
    }
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;