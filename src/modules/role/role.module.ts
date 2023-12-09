import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoleController } from './role.controller';
import RoleModel from './role.model';

@Module({
  imports: [SequelizeModule.forFeature([RoleModel])],
  providers: [RoleService],
  controllers: [RoleController],
})
export class RoleModule {}
