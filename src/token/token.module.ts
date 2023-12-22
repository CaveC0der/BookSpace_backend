import { Global, Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { SequelizeModule } from '@nestjs/sequelize';
import TokenModel from './token.model';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([TokenModel]), JwtModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
