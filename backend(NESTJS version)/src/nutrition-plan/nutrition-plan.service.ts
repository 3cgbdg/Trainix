import { Injectable } from '@nestjs/common';
import { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';
import { UpdateNutritionPlanDto } from './dto/update-nutrition-plan.dto';

@Injectable()
export class NutritionPlanService {
  create(createNutritionPlanDto: CreateNutritionPlanDto) {
    return 'This action adds a new nutritionPlan';
  }

  findAll() {
    return `This action returns all nutritionPlan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} nutritionPlan`;
  }

  update(id: number, updateNutritionPlanDto: UpdateNutritionPlanDto) {
    return `This action updates a #${id} nutritionPlan`;
  }

  remove(id: number) {
    return `This action removes a #${id} nutritionPlan`;
  }
}
