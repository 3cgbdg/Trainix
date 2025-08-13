import { IDayPlan } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IinitialState {
    workout: IDayPlan | null,
}

const initialState: IinitialState = {
    workout: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        getProfile: (state, action: PayloadAction<IDayPlan>) => {
            state.workout = action.payload
        },
        logOut: (state) => {
            state.user = null
        }
    }
})

export const { getProfile, logOut } = authSlice.actions;
export default authSlice.reducer;
