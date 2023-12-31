import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './controllers/users.controller';
import UserModel from './user.model';
import { FilesModule } from '../files/files.module';
import { MeController } from './controllers/me.controller';

@Module({
  imports: [SequelizeModule.forFeature([UserModel]), FilesModule],
  providers: [UsersService],
  controllers: [MeController, UsersController],
  exports: [UsersService],
})
export class UsersModule {}
