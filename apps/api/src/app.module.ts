import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MpesaModule } from './mpesa/mpesa.module';
import { DatabaseModule } from './database/database.module';
import { SystemModule } from './system/system.module';
import { PropertiesModule } from './properties/properties.module';
import { TenantsModule } from './tenants/tenants.module';
import { FinanceModule } from './finance/finance.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { CommunicationsModule } from './communications/communications.module';
import { InvitesModule } from './invites/invites.module';
import { AdminModule } from './admin/admin.module';
import { PortalModule } from './portal/portal.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    DatabaseModule, 
    MpesaModule, 
    SystemModule, 
    PropertiesModule, 
    TenantsModule, 
    FinanceModule,
    MaintenanceModule,
    CommunicationsModule,
    InvitesModule,
    AdminModule,
    PortalModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}










