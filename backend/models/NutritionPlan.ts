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
interface IMeal {

  mealTitle: string,
  time: number,
  imageUrl: string,
  description: string,
  ingredients: string[],
  preparation: string,
  mealCalories: number,
  mealProtein: number,
  mealCarbs: number,
  mealFats: number

}
interface IwaterIntake  {
    current: number,
    target: number
}
interface IDayPlan {
  date: Date;
  day: string;
  dailyGoals: IdailyGoals
  meals: IMeal[],
  waterIntake: IwaterIntake,
}

interface INutritionPlan {
  userId: mongoose.Types.ObjectId,
  days: IDayPlan[],
  createdAt: Date
}

export interface INutritionPlanDocument extends INutritionPlan, Document<mongoose.Types.ObjectId> { }
const fitnessPlanSchema = new mongoose.Schema<INutritionPlan>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  days: { type:[Object], required: true },
  createdAt: { type: Date, default: Date.now },

})

export default mongoose.model<INutritionPlan>("FitnessPlan", fitnessPlanSchema);