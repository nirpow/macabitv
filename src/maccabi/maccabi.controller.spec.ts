import { Test, TestingModule } from '@nestjs/testing';
import { MaccabiController } from './maccabi.controller';

describe('MaccabiController', () => {
  let controller: MaccabiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaccabiController],
    }).compile();

    controller = module.get<MaccabiController>(MaccabiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
