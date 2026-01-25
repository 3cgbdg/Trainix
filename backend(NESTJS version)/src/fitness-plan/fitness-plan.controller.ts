import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FitnessPlanService } from './fitness-plan.service';

import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard("jwt"))
@Controller('fitness-plan')
export class FitnessPlanController {
  constructor(private readonly fitnessPlanService: FitnessPlanService) { }

  @Post("days")
  async addFitnessDay(req: Request) {
    return this.fitnessPlanService.addFitnessDay()
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
  async completeWorkout() {

  }

  @Get('workouts/:day')
  async getWorkout() {

  }
}

TODO later!!!
