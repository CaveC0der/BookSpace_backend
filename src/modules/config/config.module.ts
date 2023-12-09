import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigModule as DefaultConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [DefaultConfigModule],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
