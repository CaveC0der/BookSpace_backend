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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import BookCreationDto from './dtos/book-creation.dto';
import { BooksService } from './books.service';
import { FileInterceptor } from '@nestjs/platform-express';
import BookUpdateDto from './dtos/book-update.dto';
import { Public } from '../auth/public.decorator';
import AuthGuard from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import BookModel from './models/book.model';
import FindBooksQueryDto from './dtos/find-books-query.dto';
import DeleteDto from '../shared/classes/delete.dto';
import RolesGuard from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import { TokenPayload } from '../tokens/decorators/token-payload.decorator';
import { TokenPayloadT } from '../tokens/types/token-payload.type';
import GenresDto from '../genres/dtos/genres.dto';

@ApiTags('books')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'unauthorized' })
@ApiResponse({ status: 403, description: 'forbidden' })
@ApiResponse({ status: 404, description: 'not found' })
@ApiResponse({ status: 400, description: 'invalid data provided' })
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller('books')
export class BooksController {
  constructor(private booksService: BooksService) {}

  @ApiOperation({ summary: 'create book' })
  @ApiResponse({ status: 201, type: BookModel })
  @Roles([Role.Author], [Role.Restricted])
  @Post()
  async create(@TokenPayload('id') userId: number,
               @Body() dto: BookCreationDto) {
    return this.booksService.create(userId, dto);
  }

  @ApiOperation({ summary: 'get books (public)' })
  @ApiResponse({ status: 200, type: [BookModel] })
  @Public()
  @Get()
  async getBooks(@Query() dto: FindBooksQueryDto) {
    return this.booksService.find(dto);
  }

  @ApiOperation({ summary: 'get book (public)' })
  @ApiResponse({ status: 200, type: BookModel })
  @Public()
  @Get(':id')
  async get(@TokenPayload('id') userId: number | undefined,
            @Param('id', ParseIntPipe) bookId: number) {
    return this.booksService.get(bookId, userId);
  }

  @ApiOperation({ summary: 'update book (author, admin)' })
  @Roles([Role.Author, Role.Admin], [Role.Restricted])
  @Put(':id')
  async update(@TokenPayload() payload: TokenPayloadT,
               @Param('id', ParseIntPipe) bookId: number,
               @Body() dto: BookUpdateDto) {
    await this.booksService.update(payload.id, bookId, dto, payload.admin);
  }

  @ApiOperation({ summary: 'delete book (author, admin)' })
  @Roles([Role.Author, Role.Admin])
  @Delete(':id')
  async delete(@TokenPayload() payload: TokenPayloadT,
               @Param('id', ParseIntPipe) bookId: number,
               @Query() dto: DeleteDto) {
    await this.booksService.delete(payload.id, bookId, dto.hard, payload.admin);
  }

  @ApiOperation({ summary: 'restore book (admin)' })
  @Roles([Role.Author, Role.Admin], [Role.Restricted])
  @Post(':id')
  async restore(@TokenPayload() payload: TokenPayloadT,
                @Param('id', ParseIntPipe) bookId: number) {
    await this.booksService.restore(payload.id, bookId, payload.admin);
  }

  @ApiOperation({ summary: 'set cover (author)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { img: { type: 'file', format: 'binary' } } } })
  @Roles([Role.Author], [Role.Restricted])
  @Post(':id/cover')
  @UseInterceptors(FileInterceptor('img'))
  async setCover(@TokenPayload('id') id: number,
                 @UploadedFile() file: Express.Multer.File,
                 @Param('id', ParseIntPipe) bookId: number) {
    await this.booksService.setCover(id, bookId, file);
  }

  @ApiOperation({ summary: 'delete cover (author, admin)' })
  @Roles([Role.Author, Role.Admin])
  @Delete(':id/cover')
  async deleteCover(@TokenPayload() payload: TokenPayloadT,
                    @Param('id', ParseIntPipe) bookId: number) {
    await this.booksService.deleteCover(payload.id, bookId, payload.admin);
  }

  @ApiOperation({ summary: 'add genre (author, admin)', description: 'ignores non-existing genres' })
  @Roles([Role.Author, Role.Admin])
  @Post(':id/genres')
  async addGenres(@TokenPayload() payload: TokenPayloadT,
                  @Param('id', ParseIntPipe) bookId: number,
                  @Query() dto: GenresDto) {
    await this.booksService.addGenres(payload.id, bookId, dto.names, payload.admin);
  }

  @ApiOperation({ summary: 'remove genres (author, admin)', description: 'ignores non-existing genres' })
  @Roles([Role.Author, Role.Admin])
  @Delete(':id/genres')
  async removeGenres(@TokenPayload() payload: TokenPayloadT,
                     @Param('id', ParseIntPipe) bookId: number,
                     @Query() dto: GenresDto) {
    await this.booksService.removeGenres(payload.id, bookId, dto.names, payload.admin);
  }
}
