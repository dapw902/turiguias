import { Test, TestingModule } from '@nestjs/testing';
import { GuideServicesController } from './guide-services.controller';

describe('GuideServicesController', () => {
  let controller: GuideServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuideServicesController],
    }).compile();

    controller = module.get<GuideServicesController>(GuideServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
