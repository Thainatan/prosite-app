import { Module } from '@nestjs/common';
import { SubcontractorsController } from './subcontractors.controller';

@Module({ controllers: [SubcontractorsController] })
export class SubcontractorsModule {}
