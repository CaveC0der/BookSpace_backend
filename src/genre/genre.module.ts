import { Module } from '@nestjs/common';
import { GenreService } from './genre.service';
import { GenreController } from './genre.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import GenreModel from './genre.model';

@Module({
  imports: [SequelizeModule.forFeature([GenreModel])],
  providers: [GenreService],
  controllers: [GenreController],
  exports: [GenreService],
})
export class GenreModule {}
