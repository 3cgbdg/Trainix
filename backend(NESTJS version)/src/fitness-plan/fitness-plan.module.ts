import { Module } from '@nestjs/common';
import { FitnessPlanService } from './fitness-plan.service';
import { FitnessPlanController } from './fitness-plan.controller';
import { ImagesModule } from 'src/utils/images/images.module';
import { NotificationsGateway } from 'src/webSockets/notifications.gateway';

@Module({
  imports:[ImagesModule],
  controllers: [FitnessPlanController],
  providers: [FitnessPlanService,NotificationsGateway],
})
export class FitnessPlanModule {}
