import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NutritionPlanService } from './nutrition-plan.service';
import { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';
import { UpdateNutritionPlanDto } from './dto/update-nutrition-plan.dto';

@Controller('nutrition-plan')
export class NutritionPlanController {
  constructor(private readonly nutritionPlanService: NutritionPlanService) {}

  @Post()
  create(@Body() createNutritionPlanDto: CreateNutritionPlanDto) {
    return this.nutritionPlanService.create(createNutritionPlanDto);
  }

  @Get()
  findAll() {
    return this.nutritionPlanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nutritionPlanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNutritionPlanDto: UpdateNutritionPlanDto) {
    return this.nutritionPlanService.update(+id, updateNutritionPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nutritionPlanService.remove(+id);
  }
}
