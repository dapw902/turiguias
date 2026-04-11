import { Test, TestingModule } from '@nestjs/testing';
import { GuideAvailabilityService } from './guide-availability.service';

describe('GuideAvailabilityService', () => {
  let service: GuideAvailabilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuideAvailabilityService],
    }).compile();

    service = module.get<GuideAvailabilityService>(GuideAvailabilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
