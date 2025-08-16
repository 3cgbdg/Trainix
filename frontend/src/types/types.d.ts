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