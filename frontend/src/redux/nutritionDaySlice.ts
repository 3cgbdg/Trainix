import { INutritionDayPlan } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IinitialState {
    nutritionDay: INutritionDayPlan | null,
}

const initialState: IinitialState = {
    nutritionDay: null,
}

const nutritionDaySlice = createSlice({
    name: "nutritionDay",
    initialState,
    reducers: {
        getNutritionDay: (state, action: PayloadAction<INutritionDayPlan>) => {
            state.nutritionDay = action.payload;
        },
        changeStatus: (state, action: PayloadAction<number>) => {
            if (state.nutritionDay) {
                const meal = state.nutritionDay.meals[action.payload];
                meal.status = "eaten";
                state.nutritionDay.dailyGoals.calories.current +=meal.mealCalories;
                state.nutritionDay.dailyGoals.carbs.current +=meal.mealCarbs;
                state.nutritionDay.dailyGoals.protein.current +=meal.mealProtein;
                state.nutritionDay.dailyGoals.fats.current +=meal.mealFats;
            }
        },
        logWater: (state, action: PayloadAction<number>) => {
            if (state.nutritionDay) {
                state.nutritionDay.waterIntake.current += action.payload;
            }
        },

    }
})

export const { getNutritionDay, changeStatus, logWater } = nutritionDaySlice.actions;
export default nutritionDaySlice.reducer;
