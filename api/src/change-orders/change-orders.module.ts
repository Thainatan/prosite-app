import { Module } from '@nestjs/common';
import { ChangeOrdersController } from './change-orders.controller';

@Module({ controllers: [ChangeOrdersController] })
export class ChangeOrdersModule {}
