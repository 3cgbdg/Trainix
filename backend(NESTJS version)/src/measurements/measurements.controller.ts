import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { AuthGuard } from '@nestjs/passport';
import { IReturnMessage } from 'src/types/common';
import type { Request } from 'express';
import { MeasurementType } from 'src/types/measurements';

@Controller('measurements')
@UseGuards(AuthGuard("jwt"))
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) { }

  @Post()
  createMeasurement(@Body() createMeasurementDto: CreateMeasurementDto, @Req() req: Request): Promise<IReturnMessage> {
    return this.measurementsService.createMeasurement(createMeasurementDto, (req as any).user.id);
  }

  @Get()
  getMeasurement(@Req() req: Request): Promise<MeasurementType> {
    return this.measurementsService.getMeasurement((req as any).user.id);
  }


}
