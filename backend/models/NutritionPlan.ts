import mongoose, { Document } from "mongoose";

interface IdailyGoals {
  calories: {
    current: number,
    target: number
  };
  protein: { current: number, target: number };
  carbs: { current: number, target: number };
  fats: { current: number, target: number };

}
export interface IMeal {

  mealTitle: string,
  time: string,
  imageUrl: string,
  description: string,
  ingredients: string[],
  preparation: string,
  mealCalories: number,
  mealProtein: number,
  mealCarbs: number,
  mealFats: number
  status: "eaten" | "pending",
  foodIntake: "Snack" | "Lunch" | "Breakfast" | "Dinner",
}
interface IwaterIntake {
  current: number,
  target: number
}
export interface IDayPlanNutrition {
  date: Date;
  dayNumber: number;
  dailyGoals: IdailyGoals
  meals: IMeal[],
  waterIntake: IwaterIntake,
}

export interface INutritionPlan {
  userId: mongoose.Types.ObjectId,
  days: IDayPlanNutrition[],
  createdAt: Date
}

export interface INutritionPlanDocument extends INutritionPlan, Document<mongoose.Types.ObjectId> { }
const nutritionPlanSchema = new mongoose.Schema<INutritionPlan>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  days: { type: [Object], required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<INutritionPlan>("NutritionPlan", nutritionPlanSchema);