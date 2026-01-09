import { Test, TestingModule } from '@nestjs/testing';
import { FitnessPlanService } from './fitness-plan.service';

describe('FitnessPlanService', () => {
  let service: FitnessPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FitnessPlanService],
    }).compile();

    service = module.get<FitnessPlanService>(FitnessPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
