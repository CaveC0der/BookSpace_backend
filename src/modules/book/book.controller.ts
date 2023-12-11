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
import { Roles } from '../role/decorators/roles.decorator';
import { Role } from '../role/role.enum';
import BookCreationDto from './dtos/book-creation.dto';
import { BookService } from './book.service';
import { FileInterceptor } from '@nestjs/platform-express';
import BookUpdateDto from './dtos/book-update.dto';
import { Public } from '../auth/decorators/public.decorator';
import { TokenPayloadT } from '../token/types/token-payload.type';
import { TokenPayload } from '../token/decorators/token-payload.decorator';
import AuthGuard from '../auth/guards/auth.guard';
import RolesGuard from '../role/guards/roles.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import BookModel from './book.model';
import GenreDto from '../genre/dtos/genre.dto';
import BooksQueryDto from './dtos/books-query.dto';

@ApiTags('book')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'unauthorized' })
@ApiResponse({ status: 403, description: 'forbidden' })
@ApiResponse({ status: 404, description: 'user not found' })
@ApiResponse({ status: 400, description: 'invalid data provided' })
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller('book')
export class BookController {
  constructor(private bookService: BookService) {}

  @ApiOperation({ summary: 'create book' })
  @ApiResponse({ type: BookModel })
  @Roles(Role.Author)
  @Post()
  async createBook(@TokenPayload('id') userId: number,
                   @Body() dto: BookCreationDto) {
    return this.bookService.createBook(userId, dto);
  }

  @ApiOperation({ summary: 'get book (public)' })
  @ApiResponse({ type: BookModel })
  @Public()
  @Get(':id')
  async getBook(@TokenPayload('id') userId: number | undefined,
                @Param('id', ParseIntPipe) bookId: number) {
    return this.bookService.getBook(bookId, userId);
  }

  @ApiOperation({ summary: 'update book (author, admin)' })
  @Roles(Role.Author, Role.Admin)
  @Put(':id')
  async updateBook(@TokenPayload() payload: TokenPayloadT,
                   @Param('id', ParseIntPipe) bookId: number,
                   @Body() dto: BookUpdateDto) {
    await this.bookService.updateBook(payload.id, bookId, dto, payload.admin);
  }

  @ApiOperation({ summary: 'set cover (author, admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { img: { type: 'file', format: 'binary' } } } })
  @Roles(Role.Author, Role.Admin)
  @Post(':id/cover')
  @UseInterceptors(FileInterceptor('img'))
  async setCover(@TokenPayload('id') id: number,
                 @UploadedFile() file: Express.Multer.File,
                 @Param('id', ParseIntPipe) bookId: number) {
    await this.bookService.setBookCover(id, bookId, file);
  }

  @ApiOperation({ summary: 'delete cover (author, admin)' })
  @Roles(Role.Author, Role.Admin)
  @Delete(':id/cover')
  async deleteCover(@TokenPayload() payload: TokenPayloadT,
                    @Param('id', ParseIntPipe) bookId: number) {
    await this.bookService.deleteCover(payload.id, bookId, payload.admin);
  }

  @ApiOperation({ summary: 'add genre (author, admin)' })
  @Roles(Role.Author, Role.Admin)
  @Post(':id/genres')
  async addGenre(@TokenPayload() payload: TokenPayloadT,
                 @Param('id', ParseIntPipe) bookId: number,
                 @Query() dto: GenreDto) {
    await this.bookService.addGenre(payload.id, bookId, dto.name, payload.admin);
  }

  @ApiOperation({ summary: 'exclude genre (author, admin)' })
  @Roles(Role.Author, Role.Admin)
  @Delete(':id/genres')
  async excludeGenre(@TokenPayload() payload: TokenPayloadT,
                     @Param('id', ParseIntPipe) bookId: number,
                     @Query() dto: GenreDto) {
    await this.bookService.excludeGenre(payload.id, bookId, dto.name, payload.admin);
  }

  @ApiOperation({ summary: 'get books' })
  @Public()
  @Get('s/find')
  async getBooks(@Query() dto: BooksQueryDto) {
    return this.bookService.find({}, dto);
  }

  @ApiOperation({ summary: 'get authored books' })
  @Roles(Role.Author)
  @Get('s/find/my')
  async getAuthoredBooks(@TokenPayload('id') authorId: number,
                         @Query() dto: BooksQueryDto) {
    return this.bookService.find({ authorId }, dto);
  }
}
