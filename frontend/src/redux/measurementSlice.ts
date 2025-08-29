import { IMeasurements } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IinitialState {
    measurements: IMeasurements | null,
}

const initialState: IinitialState = {
    measurements: null,
}

const measurementSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        getMeasurement: (state, action: PayloadAction<IMeasurements>) => {
            state.measurements = action.payload
        },
      
    }
})

export const { getMeasurement } = measurementSlice.actions;
export default measurementSlice.reducer;
