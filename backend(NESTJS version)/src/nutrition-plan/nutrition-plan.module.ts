import { Module } from '@nestjs/common';
import { NutritionPlanService } from './nutrition-plan.service';
import { NutritionPlanController } from './nutrition-plan.controller';
import { ImagesModule } from 'src/utils/images/images.module';

@Module({
  imports: [ImagesModule],
  controllers: [NutritionPlanController],
  providers: [NutritionPlanService],
})
export class NutritionPlanModule { }
