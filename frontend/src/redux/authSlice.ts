import { IUser } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IinitialState {
    user: IUser | null,
    initialized: boolean,
}

const initialState: IinitialState = {
    user: null,
    initialized: false,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        getProfile: (state, action: PayloadAction<IUser>) => {
            state.user = action.payload;
            state.initialized = true;
        },
        finishAuth: (state) => {
            state.initialized = true;
        },
        logOut: (state) => {
            state.user = null;
            state.initialized = true;
        }
    }
})

export const { finishAuth, getProfile, logOut } = authSlice.actions;
export default authSlice.reducer;
