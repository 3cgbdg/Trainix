import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FitnessPlanService } from './fitness-plan.service';
import { CreateFitnessPlanDto } from './dto/create-fitness-plan.dto';
import { UpdateFitnessPlanDto } from './dto/update-fitness-plan.dto';

@UseGuards()
@Controller('fitness-plan')
export class FitnessPlanController {
  constructor(private readonly fitnessPlanService: FitnessPlanService) { }

  @Post("days")
   async addFitnessDay() {
  }

  @Get("reports/numbers")
   async getNumbers() {
  }

  @Get("workouts")
   async getWorkouts() {
  }



  @Get('analysis')
   async getAnalysis() {
  }


  @Delete('plan')
   async deleteFitnessPlan() {
  }


  @Post("workouts/:day/completed")
  async completeWorkout(){

  }

  @Get('workouts/:day')
  async getWorkout(){

  }
}
