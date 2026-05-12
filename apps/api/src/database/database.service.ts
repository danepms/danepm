import { Injectable } from '@nestjs/common';
import { db, Database } from '@dane/database';

@Injectable()
export class DatabaseService {
  public readonly db: Database = db;
}
