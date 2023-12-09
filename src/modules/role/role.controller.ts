import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Put,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RoleService } from './role.service';
import RoleCreationDto from './dtos/role-creation.dto';
import { Roles } from './decorators/roles.decorator';
import { Role } from './role.enum';
import AuthGuard from '../auth/guards/auth.guard';
import RolesGuard from './guards/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import RoleModel from './role.model';
import GenreModel from '../genre/genre.model';
import { Public } from '../auth/decorators/public.decorator';
import RoleUpdateDto from './dtos/role-update.dto';

@ApiTags('role')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'unauthorized' })
@ApiResponse({ status: 403, description: 'forbidden' })
@ApiResponse({ status: 404, description: 'role not found' })
@ApiResponse({ status: 400, description: 'invalid data provided' })
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller('role')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @ApiOperation({ summary: 'create role (admin)' })
  @ApiResponse({ type: RoleModel })
  @Roles(Role.Admin)
  @Post()
  async createRole(@Body() dto: RoleCreationDto) {
    return this.roleService.createRole(dto);
  }

  @ApiOperation({ summary: 'get role' })
  @ApiResponse({ type: RoleModel })
  @Roles(Role.Reader)
  @Get(':id')
  async getRole(@Param('id', new ParseEnumPipe(Role)) name: Role) {
    return this.roleService.getRole(name);
  }

  @ApiOperation({ summary: 'update role (admin)' })
  @Roles(Role.Admin)
  @Put(':id')
  async updateRole(@Param('id') name: string,
                   @Body() dto: RoleUpdateDto) {
    await this.roleService.updateRole(name, dto.description);
  }

  @ApiOperation({ summary: 'delete role (admin)' })
  @Roles(Role.Admin)
  @Delete(':id')
  async deleteRole(@Param('id') name: string) {
    await this.roleService.deleteRole(name);
  }

  @ApiOperation({ summary: 'list roles' })
  @ApiResponse({ type: [GenreModel] })
  @Public()
  @Get('list')
  async listRoles() {
    return this.roleService.getAllRoles();
  }
}
