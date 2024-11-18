// maccabi.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MaccabiService } from './maccabi.service';
import { MaccabiController } from './maccabi.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [MaccabiService],
  controllers: [MaccabiController],
})
export class MaccabiModule {}
