import { IDayPlan } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface IWorkouts {
    items: IDayPlan[],
    dates: {
        weekDay: string,
        monthAndDate: string,

    }[],
    todayWorkoutNumber: number,
    currentWeekTitle: number,
    streak: number,

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
        updateWorkouts: (state, action: PayloadAction<{ day: IDayPlan, streak: number }>) => {
            if (!state.workouts) return;

            const index = state.workouts.items.findIndex(item => item.date === action.payload.day.date);
            if (index !== -1) {
                state.workouts.items[index] = action.payload.day;
            }

            state.workouts.streak = action.payload.streak;
        },
    }
})

export const { getWorkouts, updateWorkouts } = workoutsSlice.actions;
export default workoutsSlice.reducer;
