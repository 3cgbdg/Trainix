import { Controller, Get, Post, Delete, UseGuards, Req, Query, Param, Body } from '@nestjs/common';
import { FitnessPlanService } from './fitness-plan.service';
import { CreateFitnessPlanDto } from './dto/create-fitness-plan.dto';

import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { IReturnMessage, ReturnDataType } from 'src/types/common';
import { IReturnAnalysis, IReturnNumbers, IReturnWorkoutDays } from 'src/types/fitness-plan';
import { FitnessDay } from 'generated/prisma/browser';

@UseGuards(AuthGuard("jwt"))
@Controller('fitness-plan')
export class FitnessPlanController {
    constructor(private readonly fitnessPlanService: FitnessPlanService) { }

    @Post("days")
    async addFitnessDay(@Body() createFitnessPlanDto: CreateFitnessPlanDto, @Req() req: Request) {
        return this.fitnessPlanService.addFitnessDay(createFitnessPlanDto, (req as any).user.id)
    }

    @Get("reports/numbers")
    async getNumbers(@Query() query: { date: string, progress: string }, @Req() req: Request): Promise<ReturnDataType<IReturnNumbers>> {
        return this.fitnessPlanService.getNumbers(query.date, query.progress, (req as any).user.id)
    }

    @Get("workouts")
    async getWorkouts(@Req() req: Request): Promise<ReturnDataType<IReturnWorkoutDays>> {
        return this.fitnessPlanService.getWorkouts((req as any).user.id)
    }



    @Get('analysis')
    async getAnalysis(@Req() req: Request): Promise<ReturnDataType<IReturnAnalysis>> {
        return this.fitnessPlanService.getAnalysis((req as any).user.id)

    }


    @Delete('plan')
    async deleteFitnessPlan(@Req() req: Request): Promise<IReturnMessage> {
        return this.fitnessPlanService.deleteFitnessPlan((req as any).user.id)
    }


    @Post("workouts/:day/completed")
    async completeWorkout(@Req() req: Request, @Param("day") day: string, @Body() completedItems: { completed: boolean }[]) {
        return this.fitnessPlanService.completeWorkout(day, (req as any).user.id, completedItems)
    }

    @Get('workouts/:day')
    async getWorkout(@Req() req: Request, @Param("day") day: string): Promise<ReturnDataType<FitnessDay>> {
        return this.fitnessPlanService.getWorkout(day, (req as any).user.id)

    }
}


