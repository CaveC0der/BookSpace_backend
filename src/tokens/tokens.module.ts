import { Global, Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { SequelizeModule } from '@nestjs/sequelize';
import TokenModel from './token.model';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([TokenModel]), JwtModule],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
