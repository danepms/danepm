import { Module, Global } from '@nestjs/common';
import { db } from '@dane/database';
import { DatabaseService } from './database.service';

export const DRIZZLE = 'DRIZZLE';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useValue: db,
    },
    DatabaseService,
  ],
  exports: [DRIZZLE, DatabaseService],
})
export class DatabaseModule {}
