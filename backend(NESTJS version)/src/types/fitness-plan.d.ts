import { Decimal } from "@prisma/client/runtime/index-browser";
import { Advice, FitnessDay } from "generated/prisma/browser";

export interface IReturnWorkoutDays {
    items: FitnessDay[],
    todayWorkoutNumber: number | null,
    currentWeekTitle: string | null,
    streak: number,
}


export interface IReturnAnalysis {
    weight: { data: Decimal, difference: number },
    leanBodyMass: { data: Decimal, difference: number },
    bodyFatPercent: { data: Decimal, difference: number },
    MuscleMass: { data: Decimal, difference: number },
    bmi: { data: string, difference: number },
    imageUrlCurrent: string,
    imageUrlLast: string | null,
    waistToHipRatio: { data: Decimal, difference: number },
    advices: Advice
    advices: piecesOfadvice,
    chartData: { date: Date, bodyFat: Decimal }[]
}


export interface IReturnNumbers {
    weight: Decimal
    lastWeight: Decimal  |null
    bodyFat:Decimal
    bmi: number
    streak: number,
    longestStreak: number | undefined,
    calories: { current: number, target: number },
    weightsData: { date: Date, weight: Decimal }[] | null;
    imagesData: { date: Date, imageUrl: string }[] | null;
    fatsData: { date: Date, bodyFat: Decimal }[] | null;
    bmiData: { date: Date, bmi: number }[] | null;
    day: number,
}
