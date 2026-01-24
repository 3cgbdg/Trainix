import { Type } from "class-transformer";
import { IsArray, ValidateNested, IsString, IsInt, IsOptional, IsDate, IsNotEmpty } from "class-validator";

export class CreateNutritionPlanDto {
    @ValidateNested({ each: true })
    @Type(() => NutritionDayDto)
    day: NutritionDayDto; 

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


}

class MealDto {
  @IsString()
  @IsNotEmpty()
  mealTitle: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}


// other nested dtos type classes

