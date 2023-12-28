import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import ReviewCreationDto from './dtos/review-creation.dto';
import ReviewUpdateDto from './dtos/review-update.dto';
import AuthGuard from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import ReviewModel from './review.model';
import ReviewsQueryDto from './dtos/reviews-query.dto';
import { Public } from '../auth/public.decorator';
import RolesGuard from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import { TokenPayload } from '../tokens/decorators/token-payload.decorator';
import { TokenPayloadT } from '../tokens/types/token-payload.type';

@ApiTags('reviews')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'unauthorized' })
@ApiResponse({ status: 403, description: 'forbidden' })
@ApiResponse({ status: 404, description: 'review not found' })
@ApiResponse({ status: 400, description: 'invalid data provided' })
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'create review' })
  @ApiResponse({ status: 201, type: ReviewModel })
  @Roles(Role.Reader)
  @Post()
  async create(@TokenPayload('id') id: number,
               @Body() dto: ReviewCreationDto) {
    return this.reviewsService.create(id, dto);
  }

  @ApiOperation({ summary: 'get review' })
  @ApiResponse({ status: 200, type: ReviewModel })
  @Roles(Role.Reader)
  @Get('me-:id')
  async getMY(@TokenPayload('id') id: number,
              @Param('id', ParseIntPipe) bookId: number) {
    return this.reviewsService.get(id, bookId);
  }

  @ApiOperation({ summary: 'update review' })
  @Roles(Role.Reader)
  @Put('me-:id')
  async updateMy(@TokenPayload('id') id: number,
                 @Param('id', ParseIntPipe) bookId: number,
                 @Body() dto: ReviewUpdateDto) {
    await this.reviewsService.update(id, bookId, dto);
  }

  @ApiOperation({ summary: 'delete review' })
  @Roles(Role.Reader)
  @Delete('me-:id')
  async deleteMy(@TokenPayload('id') id: number,
                 @Param('id', ParseIntPipe) bookId: number) {
    await this.reviewsService.delete(id, id, bookId);
  }

  @ApiOperation({ summary: 'get review (public)' })
  @Public()
  @Get(':userId-:bookId')
  async get(@Param('userId', ParseIntPipe) userId: number,
            @Param('bookId', ParseIntPipe) bookId: number) {
    return this.reviewsService.get(userId, bookId);
  }

  @ApiOperation({ summary: 'delete review (admin)' })
  @Roles(Role.Admin)
  @Delete(':userId-:bookId')
  async deleteUserReview(@TokenPayload() payload: TokenPayloadT,
                         @Param('userId', ParseIntPipe) userId: number,
                         @Param('bookId', ParseIntPipe) bookId: number) {
    await this.reviewsService.delete(payload.id, userId, bookId, payload.admin);
  }

  @ApiOperation({ summary: 'get book reviews (public)' })
  @ApiResponse({ status: 200, type: [ReviewModel] })
  @Public()
  @Get('books/:id')
  async getBookReviews(@Param('id', ParseIntPipe) bookId: number,
                       @Query() dto: ReviewsQueryDto) {
    return this.reviewsService.find({ bookId }, dto);
  }

  @ApiOperation({ summary: 'get user reviews' })
  @ApiResponse({ status: 200, type: [ReviewModel] })
  @Roles(Role.Reader)
  @Get('users/:id')
  async getUserReviews(@Param('id', ParseIntPipe) userId: number,
                       @Query() dto: ReviewsQueryDto) {
    return this.reviewsService.find({ userId }, dto);
  }
}
