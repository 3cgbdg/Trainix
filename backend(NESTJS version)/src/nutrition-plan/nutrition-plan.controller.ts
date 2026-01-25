import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { NutritionPlanService } from './nutrition-plan.service';
import { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Controller('nutrition-plan')
@UseGuards(AuthGuard('jwt'))
export class NutritionPlanController {
  constructor(private readonly nutritionPlanService: NutritionPlanService) { }

  @Post()
  create(@Body() createNutritionPlanDto: CreateNutritionPlanDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.nutritionPlanService.create(createNutritionPlanDto, userId);
  }

  @Get('day')
  getNutritionDay(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.nutritionPlanService.getNutritionDay(userId);
  }

  @Get('statistics/:week')
  getWeekStatistics(@Req() req: Request, @Param('week') week: string) {
    const userId = (req as any).user.id;
    return this.nutritionPlanService.getWeekStatistics(userId, week);
  }

  @Patch('water/:day')
  updateWater(@Req() req: Request, @Param('day') day: string, @Body('amount') amount: number) {
    const userId = (req as any).user.id;
    return this.nutritionPlanService.updateWaterCurrent(userId, day, amount);
  }

  @Patch('meal-status/:day/:mealId')
  updateMealStatus(@Req() req: Request, @Param('day') day: string, @Param('mealId') mealId: string) {
    const userId = (req as any).user.id;
    return this.nutritionPlanService.updateMealStatus(userId, day, mealId);
  }
}
