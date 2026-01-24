import { PartialType } from '@nestjs/mapped-types';
import { CreateNutritionPlanDto } from './create-nutrition-plan.dto';

export class UpdateNutritionPlanDto extends PartialType(CreateNutritionPlanDto) {}
