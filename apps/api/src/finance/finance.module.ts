import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [SystemModule],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
