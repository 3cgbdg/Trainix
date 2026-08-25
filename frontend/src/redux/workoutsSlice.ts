import { IDayPlan } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface IWorkouts {
    items: IDayPlan[],
    dates: {
        weekDay: string,
        monthAndDate: string,

    }[],
    todayWorkoutNumber: number | null,
    currentWeekTitle: string | null,
    streak: number,
    hasPlan?: boolean,

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
        updateWorkouts: (state, action: PayloadAction<{ day: IDayPlan, streak?: number }>) => {
            if (!state.workouts) return;

            // matched by dayNumber, not date - a regenerated day's date comes back out of
            // an AI JSON round-trip and can differ in format/timestamp from what's already
            // stored, which made this silently fail to match and left the UI showing the
            // stale pre-regeneration workout until a manual reload
            const index = state.workouts.items.findIndex(item => item.dayNumber === action.payload.day.dayNumber);
            if (index !== -1) {
                state.workouts.items[index] = action.payload.day;
            }
            if (action.payload.streak !== undefined)
                state.workouts.streak = action.payload.streak;
        },
    }
})

export const { getWorkouts, updateWorkouts } = workoutsSlice.actions;
export default workoutsSlice.reducer;
