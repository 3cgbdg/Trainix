import { PartialType } from '@nestjs/mapped-types';
import { CreateFitnessPlanDto } from './create-fitness-plan.dto';

export class UpdateFitnessPlanDto extends PartialType(CreateFitnessPlanDto) {}
