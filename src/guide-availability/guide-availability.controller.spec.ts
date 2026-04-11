import { Test, TestingModule } from '@nestjs/testing';
import { GuideAvailabilityController } from './guide-availability.controller';

describe('GuideAvailabilityController', () => {
  let controller: GuideAvailabilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuideAvailabilityController],
    }).compile();

    controller = module.get<GuideAvailabilityController>(
      GuideAvailabilityController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
