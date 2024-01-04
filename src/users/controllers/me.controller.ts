import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  SerializeOptions,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';
import { TokenPayload } from '../../tokens/decorators/token-payload.decorator';
import UserUpdateDto from '../dtos/user-update.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import BookModel from '../../books/models/book.model';
import BooksQueryDto from '../../books/dtos/books-query.dto';
import { UsersService } from '../users.service';
import AuthGuard from '../../auth/guards/auth.guard';
import RolesGuard from '../../roles/roles.guard';
import { TokenPayloadT } from '../../tokens/types/token-payload.type';

@ApiTags('users')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'unauthorized' })
@ApiResponse({ status: 403, description: 'forbidden' })
@ApiResponse({ status: 404, description: 'user not found' })
@ApiResponse({ status: 400, description: 'invalid data provided' })
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller('users/me')
export class MeController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'update user' })
  @Roles([Role.User], [Role.Restricted])
  @Put()
  async update(@TokenPayload('id') id: number,
               @Body() dto: UserUpdateDto) {
    await this.usersService.update(id, dto);
  }

  @ApiOperation({ summary: 'delete user' })
  @Roles([Role.User])
  @Delete()
  async delete(@TokenPayload('id') id: number) {
    await this.usersService.delete(id);
  }

  @ApiOperation({ summary: 'set avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { img: { type: 'file', format: 'binary' } } } })
  @Roles([Role.User], [Role.Restricted])
  @Post('avatar')
  @UseInterceptors(FileInterceptor('img'))
  async setAvatar(@TokenPayload('id') id: number,
                  @UploadedFile() file: Express.Multer.File) {
    await this.usersService.setAvatar(id, file);
  }

  @ApiOperation({ summary: 'delete avatar' })
  @Roles([Role.User])
  @Delete('avatar')
  async deleteAvatar(@TokenPayload('id') id: number) {
    await this.usersService.deleteAvatar(id);
  }

  @ApiOperation({ summary: 'get authored books' })
  @ApiResponse({ status: 200, type: [BookModel] })
  @Roles([Role.Author])
  @Get('books/authored')
  async getAuthoredBooks(@TokenPayload('id') id: number,
                         @Query() dto: BooksQueryDto) {
    return this.usersService.getBooks(id, 'authored', dto);
  }

  @ApiOperation({ summary: 'get viewed books' })
  @ApiResponse({ status: 200, type: [BookModel] })
  @Roles([Role.User])
  @Get('books/viewed')
  async getViewedBooks(@TokenPayload() payload: TokenPayloadT,
                       @Query() dto: BooksQueryDto) {
    dto.paranoid = payload.admin ? dto.paranoid : undefined;

    return this.usersService.getBooks(payload.id, 'viewed', dto);
  }
}
