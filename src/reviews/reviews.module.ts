import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import ReviewModel from './review.model';

@Module({
  imports: [SequelizeModule.forFeature([ReviewModel])],
  providers: [ReviewsService],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
