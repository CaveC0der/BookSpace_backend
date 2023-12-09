import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import CommentModel from './comment.model';

@Module({
  imports: [SequelizeModule.forFeature([CommentModel])],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
