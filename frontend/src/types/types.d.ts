export interface IUser {
  firstName: string,
  lastName: string,
  password: string,
  email: string,
  dateOfBirth: Date,
  gender: string,
  metrics: {
    weight: number,
    height: number,
    waistToHipRatio: number,
    shoulerToWaistRatio: number,
    percentOfLegsLength: number,
    shoulderAsymmetricLine: number,
    shoulderAngle: number

  },
  imageUrl: string,
  streak: number,
  targetWeight: number,
  fitnessLevel: "Beginner" | "Intermediate" | "Advanced",
  primaryFitnessGoal: "Lose weight" | "Gain muscle" | "Stay fit" | "Improve endurance",
  emailNotifications: boolean,
  inAppNotifications: boolean,
}

export interface IDayPlan {
  day: string;
  exercises: IExercise[];
  status: "Pending" | 'Completed' | "Missed",
  calories: number,
  date: Date,
}
export interface IExercise {
  title: string;
  repeats: number | null;
  time: number | null;
  instruction: string,
  advices: string,
  calories: number,
  status: "completed" | "incompleted",
}



//  NUTRITION PLAN INTERFACES 
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
  time: number,
  imageUrl: string,
  description: string,
  ingredients: string[],
  preparation: string,
  mealCalories: number,
  mealProtein: number,
  mealCarbs: number,
  mealFats: number
  status:"eaten"|"pending",

}
interface IwaterIntake  {
    current: number,
    target: number
}
interface INutritionDayPlan {
  date: Date;
  dayNumber: number;
  dailyGoals: IdailyGoals
  meals: IMeal[],
  waterIntake: IwaterIntake,
}

interface INutritionPlan {
  userId: mongoose.Types.ObjectId,
  days: IDayPlan[],
  createdAt: Date
}

