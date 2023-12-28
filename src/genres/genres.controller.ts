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
import { GenresService } from './genres.service';
import GenreCreationDto from './dtos/genre-creation.dto';
import AuthGuard from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import GenreModel from './models/genre.model';
import { Public } from '../auth/public.decorator';
import GenreUpdateDto from './dtos/genre-update.dto';
import RolesGuard from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import BookModel from '../books/models/book.model';
import BooksQueryDto from '../books/dtos/books-query.dto';

@ApiTags('genres')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'unauthorized' })
@ApiResponse({ status: 403, description: 'forbidden' })
@ApiResponse({ status: 404, description: 'role not found' })
@ApiResponse({ status: 400, description: 'invalid data provided' })
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller('genres')
export class GenresController {
  constructor(private genresService: GenresService) {}

  @ApiOperation({ summary: 'create genre (admin)' })
  @ApiResponse({ status: 201, type: GenreModel })
  @Roles(Role.Admin)
  @Post()
  async create(@Body() dto: GenreCreationDto) {
    return this.genresService.create(dto);
  }

  @ApiOperation({ summary: 'get genres (public)' })
  @ApiResponse({ status: 200, type: [GenreModel] })
  @Public()
  @Get()
  async getAll() {
    return this.genresService.getMany();
  }

  @ApiOperation({ summary: 'get genre (public)' })
  @ApiResponse({ status: 200, type: GenreModel })
  @Public()
  @Get(':id')
  async get(@Param('id') name: string) {
    return this.genresService.get(name);
  }

  @ApiOperation({ summary: 'update genre (admin)' })
  @Roles(Role.Admin)
  @Put(':id')
  async update(@Param('id') name: string,
               @Body() dto: GenreUpdateDto) {
    await this.genresService.update(name, dto.description);
  }

  @ApiOperation({ summary: 'delete genre (admin)' })
  @Roles(Role.Admin)
  @Delete(':id')
  async delete(@Param('id') name: string) {
    await this.genresService.delete(name);
  }

  @ApiOperation({ summary: 'get genre books (public)' })
  @ApiResponse({ status: 200, type: [BookModel] })
  @Public()
  @Get(':id/books')
  async findGenreBooks(@Param('id') name: string,
                       @Query() dto: BooksQueryDto) {
    return this.genresService.getGenreBooks(name, dto);
  }
}
