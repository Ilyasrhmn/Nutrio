import { Controller, Get, UseGuards } from '@nestjs/common';
import { FundsService } from './funds.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('funds')
@UseGuards(JwtAuthGuard)
export class FundsController {
  constructor(private readonly fundsService: FundsService) {}

  @Get('summary')
  getSummary() {
    return this.fundsService.getSummary();
  }

  @Get('transactions')
  getTransactions() {
    return this.fundsService.getTransactions();
  }
}
