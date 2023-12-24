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
import { CommentsService } from './comments.service';
import CommentCreationDto from './dtos/comment-creation.dto';
import AuthGuard from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import CommentModel from './comment.model';
import CommentUpdateDto from './dtos/comment-update.dto';
import { Public } from '../auth/public.decorator';
import CommentsQueryDto from './dtos/comments-query.dto';
import RolesGuard from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import { TokenPayload } from '../tokens/decorators/token-payload.decorator';
import { TokenPayloadT } from '../tokens/types/token-payload.type';

@ApiTags('comment')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'unauthorized' })
@ApiResponse({ status: 403, description: 'forbidden' })
@ApiResponse({ status: 404, description: 'review not found' })
@ApiResponse({ status: 400, description: 'invalid data provided' })
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @ApiOperation({ summary: 'create comment' })
  @ApiResponse({ status: 201, type: CommentModel })
  @Roles(Role.Reader)
  @Post()
  async create(@TokenPayload('id') id: number,
               @Body() dto: CommentCreationDto) {
    return this.commentsService.create(id, dto);
  }

  @ApiOperation({ summary: 'get comment' })
  @ApiResponse({ status: 200, type: CommentModel })
  @Roles(Role.Reader)
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.get(id);
  }

  @ApiOperation({ summary: 'update comment' })
  @Roles(Role.Reader)
  @Put(':id')
  async update(@TokenPayload('id') userId: number,
               @Param('id', ParseIntPipe) commentId: number,
               @Body() dto: CommentUpdateDto) {
    await this.commentsService.update(userId, commentId, dto.text);
  }

  @ApiOperation({ summary: 'delete comment (user, admin)' })
  @Roles(Role.Reader, Role.Admin)
  @Delete(':id')
  async delete(@TokenPayload() payload: TokenPayloadT,
               @Param('id', ParseIntPipe) commentId: number) {
    await this.commentsService.delete(payload.id, commentId, payload.admin);
  }

  @ApiOperation({ summary: 'get book comments (public)' })
  @ApiResponse({ status: 200, type: [CommentModel] })
  @Public()
  @Get('books/:id')
  async getBookComments(@Param('id', ParseIntPipe) bookId: number,
                        @Query() dto: CommentsQueryDto) {
    return this.commentsService.find({ bookId }, dto);
  }

  @ApiOperation({ summary: 'get user comments' })
  @ApiResponse({ status: 200, type: [CommentModel] })
  @Roles(Role.Reader)
  @Get('users/:id')
  async getUserComments(@Param('id', ParseIntPipe) userId: number,
                        @Query() dto: CommentsQueryDto) {
    return this.commentsService.find({ userId }, dto);
  }
}
