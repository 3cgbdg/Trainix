import { Test, TestingModule } from '@nestjs/testing';
import { FitnessPlanController } from './fitness-plan.controller';
import { FitnessPlanService } from './fitness-plan.service';

describe('FitnessPlanController', () => {
  let controller: FitnessPlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FitnessPlanController],
      providers: [FitnessPlanService],
    }).compile();

    controller = module.get<FitnessPlanController>(FitnessPlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
