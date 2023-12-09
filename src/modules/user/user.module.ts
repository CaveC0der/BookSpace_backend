import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from './user.controller';
import UserModel from './user.model';
import { FileModule } from '../file/file.module';

@Module({
  imports: [SequelizeModule.forFeature([UserModel]), FileModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
