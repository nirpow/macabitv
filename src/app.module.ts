import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MaccabiModule } from './maccabi/maccabi.module';

@Module({
  imports: [MaccabiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
