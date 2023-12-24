import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { RolesController } from './roles.controller';
import RoleModel from './models/role.model';

@Module({
  imports: [SequelizeModule.forFeature([RoleModel])],
  providers: [RolesService],
  controllers: [RolesController],
})
export class RolesModule {}
