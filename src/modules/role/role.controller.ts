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
  Query,
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
import { Public } from '../auth/decorators/public.decorator';
import RoleUpdateDto from './dtos/role-update.dto';
import UserModel from '../user/user.model';
import UsersQueryDto from '../user/dtos/users-query.dto';

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
  async create(@Body() dto: RoleCreationDto) {
    return this.roleService.create(dto);
  }

  @ApiOperation({ summary: 'get role' })
  @ApiResponse({ type: RoleModel })
  @Roles(Role.Reader)
  @Get(':id')
  async get(@Param('id', new ParseEnumPipe(Role)) name: Role) {
    return this.roleService.get(name);
  }

  @ApiOperation({ summary: 'update role (admin)' })
  @Roles(Role.Admin)
  @Put(':id')
  async update(@Param('id', new ParseEnumPipe(Role)) name: Role,
               @Body() dto: RoleUpdateDto) {
    await this.roleService.update(name, dto.description);
  }

  @ApiOperation({ summary: 'delete role (admin)' })
  @Roles(Role.Admin)
  @Delete(':id')
  async delete(@Param('id', new ParseEnumPipe(Role)) name: Role) {
    await this.roleService.delete(name);
  }

  @ApiOperation({ summary: 'list roles (public)' })
  @ApiResponse({ type: [RoleModel] })
  @Public()
  @Get('list')
  async list() {
    return this.roleService.getAll();
  }

  @ApiOperation({ summary: 'get role users' })
  @ApiResponse({ type: [UserModel] })
  @Roles(Role.Reader)
  @Get(':id/users')
  async findRoleUsers(@Param('id', new ParseEnumPipe(Role)) name: Role,
                      @Query() dto: UsersQueryDto) {
    return this.roleService.getRoleUsers(name, dto);
  }
}
