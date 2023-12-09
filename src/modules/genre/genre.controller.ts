import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
  async createGenre(@Body() dto: GenreCreationDto) {
    return this.genreService.createGenre(dto);
  }

  @ApiOperation({ summary: 'get genre' })
  @ApiResponse({ type: GenreModel })
  @Roles(Role.Reader)
  @Get(':id')
  async getGenre(@Param('id') name: string) {
    return this.genreService.getGenre(name);
  }

  @ApiOperation({ summary: 'update genre (admin)' })
  @Roles(Role.Admin)
  @Put(':id')
  async updateGenre(@Param('id') name: string,
                    @Body() dto: GenreUpdateDto) {
    await this.genreService.updateGenre(name, dto.description);
  }

  @ApiOperation({ summary: 'delete genre (admin)' })
  @Roles(Role.Admin)
  @Delete(':id')
  async deleteGenre(@Param('id') name: string) {
    await this.genreService.deleteGenre(name);
  }

  @ApiOperation({ summary: 'list genres' })
  @ApiResponse({ type: [GenreModel] })
  @Public()
  @Get('list')
  async listGenres() {
    return this.genreService.getAllGenres();
  }
}
