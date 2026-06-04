import { Controller, Post, Patch, Get, Param, Body } from '@nestjs/common';
import { EligibilityService } from './eligibility.service';
import { SaveAnswerDto } from './dto/save-answer.dto';

@Controller('eligibility')
export class EligibilityController {
  constructor(private readonly eligibilityService: EligibilityService) {}

  @Post('sessions')
  createSession() {
    return this.eligibilityService.createSession();
  }

  @Patch('sessions/:token')
  saveAnswer(@Param('token') token: string, @Body() dto: SaveAnswerDto) {
    return this.eligibilityService.saveAnswer(token, dto);
  }

  @Post('sessions/:token/generate')
  generateRoadmap(@Param('token') token: string) {
    return this.eligibilityService.generateRoadmap(token);
  }

  @Get('sessions/:token')
  getSession(@Param('token') token: string) {
    return this.eligibilityService.getSession(token);
  }
}
