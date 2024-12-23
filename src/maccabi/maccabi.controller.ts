import { Controller, Post, Body, Get, HttpCode } from '@nestjs/common';
import { MaccabiService } from './maccabi.service';

@Controller('maccabi')
export class MaccabiController {
  constructor(private readonly maccabiService: MaccabiService) {}

  @HttpCode(200)
  @Post('login')
  async login(@Body() loginDto: { userId: string; password: string }) {
    return this.maccabiService.loginToMaccabi(
      loginDto.userId,
      loginDto.password,
    );
  }

  @Get('treatments')
  async getMyTreatments() {
    return await this.maccabiService.getMyTreatmentsList();
  }

  @Get('clinics')
  async getClinics(@Body() body: { treatmentId: number }) {
    return await this.maccabiService.getClinicsByTreatment(body.treatmentId);
  }

  @Get('therapist')
  async getTherapist(
    @Body()
    body: {
      treatmentCode: number;
      clinicId: number;
      stringDate: string;
    },
  ) {
    return await this.maccabiService.getTherapists(
      body.treatmentCode,
      body.clinicId,
      body.stringDate,
    );
  }
}
