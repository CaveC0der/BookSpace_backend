import { Module } from '@nestjs/common';
import { GenresService } from './genres.service';
import { GenresController } from './genres.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import GenreModel from './models/genre.model';

@Module({
  imports: [SequelizeModule.forFeature([GenreModel])],
  providers: [GenresService],
  controllers: [GenresController],
  exports: [GenresService],
})
export class GenresModule {}
