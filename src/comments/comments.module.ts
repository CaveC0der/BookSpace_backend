import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import CommentModel from './comment.model';

@Module({
  imports: [SequelizeModule.forFeature([CommentModel])],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
