import { Test, TestingModule } from '@nestjs/testing';
import { MaccabiService } from './maccabi.service';

describe('MaccabiService', () => {
  let service: MaccabiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaccabiService],
    }).compile();

    service = module.get<MaccabiService>(MaccabiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
