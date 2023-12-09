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
import { CommentService } from './comment.service';
import { Roles } from '../role/decorators/roles.decorator';
import { Role } from '../role/role.enum';
import CommentCreationDto from './dtos/comment-creation.dto';
import { TokenPayloadT } from '../token/types/token-payload.type';
import { TokenPayload } from '../token/decorators/token-payload.decorator';
import AuthGuard from '../auth/guards/auth.guard';
import RolesGuard from '../role/guards/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import CommentModel from './comment.model';
import CommentUpdateDto from './dtos/comment-update.dto';
import { Public } from '../auth/decorators/public.decorator';
import CommentsQueryDto from './dtos/comments-query.dto';

@ApiTags('comment')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'unauthorized' })
@ApiResponse({ status: 403, description: 'forbidden' })
@ApiResponse({ status: 404, description: 'review not found' })
@ApiResponse({ status: 400, description: 'invalid data provided' })
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @ApiOperation({ summary: 'create comment' })
  @ApiResponse({ type: CommentModel })
  @Roles(Role.Reader)
  @Post()
  async createComment(@TokenPayload('id') id: number,
                      @Body() dto: CommentCreationDto) {
    return this.commentService.createComment(id, dto);
  }

  @ApiOperation({ summary: 'get comment' })
  @ApiResponse({ type: CommentModel })
  @Roles(Role.Reader)
  @Get(':id')
  async getComment(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.getComment(id);
  }

  @ApiOperation({ summary: 'update comment' })
  @Roles(Role.Reader)
  @Put(':id')
  async updateComment(@TokenPayload('id') userId: number,
                      @Param('id', ParseIntPipe) commentId: number,
                      @Body() dto: CommentUpdateDto) {
    await this.commentService.updateComment(userId, commentId, dto.text);
  }

  @ApiOperation({ summary: 'delete comment (user, admin)' })
  @Roles(Role.Reader, Role.Admin)
  @Delete(':id')
  async deleteComment(@TokenPayload() payload: TokenPayloadT,
                      @Param('id', ParseIntPipe) commentId: number) {
    await this.commentService.deleteComment(payload.id, commentId, payload.admin);
  }

  @ApiOperation({ summary: 'get book comments' })
  @Public()
  @Get('s/:bookId')
  async getBookComments(@Param('bookId', ParseIntPipe) bookId: number,
                        @Query() dto: CommentsQueryDto) {
    return this.commentService.find({ bookId }, dto);
  }
}
