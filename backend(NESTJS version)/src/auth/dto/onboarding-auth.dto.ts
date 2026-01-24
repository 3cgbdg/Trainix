import { IsDecimal, IsNotEmpty, Matches } from "class-validator";
import { FitnessLevelType, PrimaryFitnessGoalType } from "generated/prisma/enums";

export class OnBoardingAuthDto {

    @IsNotEmpty()
    @IsDecimal()
    height: number;

    @IsNotEmpty()
    @IsDecimal()
    weight: number;

    @IsNotEmpty()
    @IsDecimal()
    targetWeight: number;

    @IsNotEmpty()
    primaryFitnessGoal: PrimaryFitnessGoalType

    @IsNotEmpty()
    fitnessLevel: FitnessLevelType


}
