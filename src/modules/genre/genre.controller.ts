import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GenreService } from './genre.service';
import { Roles } from '../role/decorators/roles.decorator';
import { Role } from '../role/role.enum';
import GenreCreationDto from './dtos/genre-creation.dto';
import AuthGuard from '../auth/guards/auth.guard';
import RolesGuard from '../role/guards/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import GenreModel from './genre.model';
import { Public } from '../auth/decorators/public.decorator';
import GenreUpdateDto from './dtos/genre-update.dto';
import BookModel from '../book/book.model';
import BooksQueryDto from '../book/dtos/books-query.dto';

@ApiTags('genre')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'unauthorized' })
@ApiResponse({ status: 403, description: 'forbidden' })
@ApiResponse({ status: 404, description: 'role not found' })
@ApiResponse({ status: 400, description: 'invalid data provided' })
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller('genre')
export class GenreController {
  constructor(private genreService: GenreService) {}

  @ApiOperation({ summary: 'create genre (admin)' })
  @ApiResponse({ type: GenreModel })
  @Roles(Role.Admin)
  @Post()
  async create(@Body() dto: GenreCreationDto) {
    return this.genreService.create(dto);
  }

  @ApiOperation({ summary: 'get genre (public)' })
  @ApiResponse({ type: GenreModel })
  @Public()
  @Get(':id')
  async get(@Param('id') name: string) {
    return this.genreService.get(name);
  }

  @ApiOperation({ summary: 'update genre (admin)' })
  @Roles(Role.Admin)
  @Put(':id')
  async update(@Param('id') name: string,
               @Body() dto: GenreUpdateDto) {
    await this.genreService.update(name, dto.description);
  }

  @ApiOperation({ summary: 'delete genre (admin)' })
  @Roles(Role.Admin)
  @Delete(':id')
  async delete(@Param('id') name: string) {
    await this.genreService.delete(name);
  }

  @ApiOperation({ summary: 'list genres (public)' })
  @ApiResponse({ type: [GenreModel] })
  @Public()
  @Get('list')
  async list() {
    return this.genreService.getAll();
  }

  @ApiOperation({ summary: 'get genre books (public)' })
  @ApiResponse({ type: [BookModel] })
  @Public()
  @Get(':id/books')
  async findGenreBooks(@Param('id') name: string,
                       @Query() dto: BooksQueryDto) {
    return this.genreService.getGenreBooks(name, dto);
  }
}
