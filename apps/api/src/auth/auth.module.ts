import { Module, Global } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { DatabaseModule } from '../database/database.module';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
