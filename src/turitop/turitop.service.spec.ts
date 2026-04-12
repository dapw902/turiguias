import { Test, TestingModule } from '@nestjs/testing';
import { TuritopService } from './turitop.service';

describe('TuritopService', () => {
  let service: TuritopService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TuritopService],
    }).compile();

    service = module.get<TuritopService>(TuritopService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
