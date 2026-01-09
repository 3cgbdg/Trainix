import { Module } from '@nestjs/common';
import { FitnessPlanService } from './fitness-plan.service';
import { FitnessPlanController } from './fitness-plan.controller';

@Module({
  controllers: [FitnessPlanController],
  providers: [FitnessPlanService],
})
export class FitnessPlanModule {}
