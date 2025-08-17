import { IDayPlan } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface IWorkouts {
    items: IDayPlan[],
    dates: {
        weekDay: string,
        monthAndDate: string,

    }[],
    todayWorkoutNumber: number,
    currentWeekTitle: number,

}
interface IinitialState {
    workouts: IWorkouts | null,
}

const initialState: IinitialState = {
    workouts: null,
}

const workoutsSlice = createSlice({
    name: "fitnessPlan",
    initialState,
    reducers: {
        getWorkouts: (state, action: PayloadAction<IWorkouts>) => {
            state.workouts = action.payload
        },
    }
})

export const { getWorkouts } = workoutsSlice.actions;
export default workoutsSlice.reducer;
