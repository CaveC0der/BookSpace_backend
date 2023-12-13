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
import { Roles } from '../role/decorators/roles.decorator';
import { Role } from '../role/role.enum';
import { ReviewService } from './review.service';
import ReviewCreationDto from './dtos/review-creation.dto';
import ReviewUpdateDto from './dtos/review-update.dto';
import { TokenPayloadT } from '../token/types/token-payload.type';
import { TokenPayload } from '../token/decorators/token-payload.decorator';
import AuthGuard from '../auth/guards/auth.guard';
import RolesGuard from '../role/guards/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import ReviewModel from './review.model';
import ReviewsQueryDto from './dtos/reviews-query.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('review')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'unauthorized' })
@ApiResponse({ status: 403, description: 'forbidden' })
@ApiResponse({ status: 404, description: 'review not found' })
@ApiResponse({ status: 400, description: 'invalid data provided' })
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller('review')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @ApiOperation({ summary: 'create review' })
  @ApiResponse({ type: ReviewModel })
  @Roles(Role.Reader)
  @Post()
  async create(@TokenPayload('id') id: number,
               @Body() dto: ReviewCreationDto) {
    return this.reviewService.create(id, dto);
  }

  @ApiOperation({ summary: 'get review' })
  @ApiResponse({ type: ReviewModel })
  @Roles(Role.Reader)
  @Get(':bookId')
  async get(@TokenPayload('id') id: number,
            @Param('bookId', ParseIntPipe) bookId: number) {
    return this.reviewService.get(id, bookId);
  }

  @ApiOperation({ summary: 'update review' })
  @Roles(Role.Reader)
  @Put(':bookId')
  async update(@TokenPayload('id') id: number,
               @Body() dto: ReviewUpdateDto) {
    await this.reviewService.update(id, dto);
  }

  @ApiOperation({ summary: 'delete review (user, admin)' })
  @Roles(Role.Reader, Role.Admin)
  @Delete(':userId-:bookId')
  async delete(@TokenPayload() payload: TokenPayloadT,
               @Param('userId', ParseIntPipe) userId: number,
               @Param('bookId', ParseIntPipe) bookId: number) {
    await this.reviewService.delete(payload.id, userId, bookId, payload.admin);
  }

  @ApiOperation({ summary: 'get user reviews' })
  @ApiResponse({ type: [ReviewModel] })
  @Roles(Role.Reader)
  @Get('s/my')
  async getReviews(@TokenPayload('id') userId: number,
                   @Query() dto: ReviewsQueryDto) {
    return this.reviewService.find({ userId }, dto);
  }

  @ApiOperation({ summary: 'get book reviews (public)' })
  @ApiResponse({ type: [ReviewModel] })
  @Public()
  @Get('s/:bookId')
  async getBookReviews(@Param('bookId', ParseIntPipe) bookId: number,
                       @Query() dto: ReviewsQueryDto) {
    return this.reviewService.find({ bookId }, dto);
  }
}
