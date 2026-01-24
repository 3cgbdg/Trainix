import { Module } from '@nestjs/common';
import { NutritionPlanService } from './nutrition-plan.service';
import { NutritionPlanController } from './nutrition-plan.controller';

@Module({
  controllers: [NutritionPlanController],
  providers: [NutritionPlanService],
})
export class NutritionPlanModule {}
