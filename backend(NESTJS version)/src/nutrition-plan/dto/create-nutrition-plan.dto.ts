import { Type } from "class-transformer";
import { IsArray, ValidateNested, IsString, IsInt, IsOptional, IsDate, IsNotEmpty } from "class-validator";

export class CreateNutritionPlanDto {
    @ValidateNested({ each: true })
    @Type(() => NutritionDayDto)
    day: NutritionDayDto;
}

export class DailyGoalsDto {
    @IsInt()
    caloriesTarget: number;

    @IsInt()
    proteinTarget: number;

    @IsInt()
    carbsTarget: number;

    @IsInt()
    fatsTarget: number;

    @IsInt()
    @IsOptional()
    caloriesCurrent?: number;

    @IsInt()
    @IsOptional()
    proteinCurrent?: number;

    @IsInt()
    @IsOptional()
    carbsCurrent?: number;

    @IsInt()
    @IsOptional()
    fatsCurrent?: number;
}


class NutritionDayDto {
    @IsInt()
    dayNumber: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    date?: Date;

    @ValidateNested({ each: true })
    @Type(() => MealDto)
    meals: MealDto[];

    @IsOptional()
    waterCurrent?: number;

    @IsOptional()
    waterTarget?: number;

    @IsOptional()
    @ValidateNested()
    @Type(() => DailyGoalsDto)
    dailyGoals?: DailyGoalsDto;
}

export class MealDto {
    @IsString()
    @IsNotEmpty()
    mealTitle: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsString()
    cookingTime: string;

    @IsString()
    description: string;

    @IsString()
    preparation: string;

    @IsInt()
    mealCalories: number;

    @IsInt()
    mealProtein: number;

    @IsInt()
    mealCarbs: number;

    @IsInt()
    mealFats: number;

    @IsString()
    status: "EATEN" | "PENDING";

    @IsString()
    foodIntake: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    ingredients?: string[];
}


// other nested dtos type classes

