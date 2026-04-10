import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from './clients/clients.module';
import { QuotesModule } from './quotes/quotes.module';
import { ProjectsModule } from './projects/projects.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { SettingsModule } from './settings/settings.module';
import { SubcontractorsModule } from './subcontractors/subcontractors.module';
import { ChangeOrdersModule } from './change-orders/change-orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    ClientsModule,
    QuotesModule,
    ProjectsModule,
    InvoicesModule,
    TasksModule,
    SettingsModule,
    SubcontractorsModule,
    ChangeOrdersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
