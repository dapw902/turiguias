import { Test, TestingModule } from '@nestjs/testing';
import { GuideServicesService } from './guide-services.service';

describe('GuideServicesService', () => {
  let service: GuideServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuideServicesService],
    }).compile();

    service = module.get<GuideServicesService>(GuideServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
