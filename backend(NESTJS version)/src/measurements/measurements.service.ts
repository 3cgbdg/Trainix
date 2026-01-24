import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { PrismaService } from 'prisma/prisma.service';
import { MeasurementType } from 'src/types/measurements';
import { IReturnMessage } from 'src/types/common';

@Injectable()
export class MeasurementsService {

  constructor(private readonly prisma: PrismaService) { }

  async getMeasurement(myId: string): Promise<MeasurementType> {

    const measurement = await this.prisma.measurement.findFirst({ where: { id: myId }, include: { metrics: true }, orderBy: { createdAt: 'desc' } });
    if (!measurement) {
      throw new NotFoundException("Measurement not found")
    }
    return measurement;

  }
  async createMeasurement(dto: CreateMeasurementDto, myId: string): Promise<IReturnMessage> {
    await this.prisma.measurement.create({
      data: {
        metrics: { connect: { id: dto.metricsId } },
        user: { connect: { id: myId } },
        imageUrl: dto.imageUrl,
      }
    })
    return ({ message: "Successfully created!" });

  }
}


