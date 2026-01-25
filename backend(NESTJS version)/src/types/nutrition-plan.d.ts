import { Prisma } from "generated/prisma/browser";


export type ReturnNutritionDayType = Prisma.NutritionDayGetPayload<{
    include:
    {
        meals:
        {
            include: { ingredients: true, mealImage: true }
        },
        dailyGoals: true,
        waterIntake: true
    }
}>

export interface INutritionDayStatistics {
    day: string,
    calories?: number,
    protein?: number,
    carbs?: number,
    fats?: number
}

export type ReturnNutritionStatisticsType = {
    data:INutritionDayStatistics[]
}