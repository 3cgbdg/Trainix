import { Type } from "class-transformer";
import { IsArray, ValidateNested, IsString, IsInt, IsOptional, IsDate, IsNotEmpty, IsEnum } from "class-validator";
import { ExerciseStatusType, FitnessLevelType, PrimaryFitnessGoalType } from "generated/prisma/enums";

export class CreateFitnessPlanDto {
    @IsString()
    week1Title: string;
    @IsString()
    week2Title: string;
    @IsString()
    week3Title: string;
    @IsString()
    week4Title: string;

    @ValidateNested()
    @Type(() => AdviceDto)
    advices: AdviceDto;

    @ValidateNested()
    @Type(() => BriefAnalysisDto)
    briefAnalysis: BriefAnalysisDto;

    @ValidateNested()
    @Type(() => FitnessDayDto)
    day: FitnessDayDto;
}

export class AdviceDto {
    @IsString()
    nutrition: string;
    @IsString()
    hydration: string;
    @IsString()
    recovery: string;
    @IsString()
    progress: string;
}

export class BriefAnalysisDto {
    @IsInt()
    targetWeight: number;
    @IsEnum(FitnessLevelType)
    fitnessLevel: FitnessLevelType;
    @IsEnum(PrimaryFitnessGoalType)
    primaryFitnessGoal: PrimaryFitnessGoalType;
}

export class FitnessDayDto {
    @IsInt()
    dayNumber: number;

    @IsString()
    dayTitle: string;

    @IsInt()
    calories: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    date?: Date;

    @ValidateNested({ each: true })
    @Type(() => ExerciseDto)
    exercises: ExerciseDto[];

    @IsString()
    @IsOptional()
    status?: "PENDING" | "COMPLETED" | "MISSED" = "PENDING";
}

export class ExerciseDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsOptional()
    @IsInt()
    repeats?: number;

    @IsOptional()
    @IsInt()
    time?: number;

    @IsString()
    instruction: string;

    @IsString()
    advices: string;

    @IsInt()
    calories: number;

    @IsString()
    @IsOptional()
    status?: ExerciseStatusType = "PENDING";

    @IsOptional()
    @IsString()
    imageUrl?: string;
}
