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
import { RolesService } from './roles.service';
import RoleCreationDto from './dtos/role-creation.dto';
import { Roles } from './roles.decorator';
import { Role } from './role.enum';
import AuthGuard from '../auth/guards/auth.guard';
import RolesGuard from './roles.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import RoleModel from './models/role.model';
import { Public } from '../auth/public.decorator';
import RoleUpdateDto from './dtos/role-update.dto';
import UserModel from '../users/user.model';
import UsersQueryDto from '../users/dtos/users-query.dto';

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
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @ApiOperation({ summary: 'create role (admin)' })
  @ApiResponse({ status: 201, type: RoleModel })
  @Roles(Role.Admin)
  @Post()
  async create(@Body() dto: RoleCreationDto) {
    return this.rolesService.create(dto);
  }

  @ApiOperation({ summary: 'get roles (public)' })
  @ApiResponse({ status: 200, type: [RoleModel] })
  @Public()
  @Get()
  async getAll() {
    return this.rolesService.getAll();
  }

  @ApiOperation({ summary: 'get role' })
  @ApiResponse({ status: 200, type: RoleModel })
  @Roles(Role.Reader)
  @Get(':id')
  async get(@Param('id', new ParseEnumPipe(Role)) name: Role) {
    return this.rolesService.get(name);
  }

  @ApiOperation({ summary: 'update role (admin)' })
  @Roles(Role.Admin)
  @Put(':id')
  async update(@Param('id', new ParseEnumPipe(Role)) name: Role,
               @Body() dto: RoleUpdateDto) {
    await this.rolesService.update(name, dto.description);
  }

  @ApiOperation({ summary: 'delete role (admin)' })
  @Roles(Role.Admin)
  @Delete(':id')
  async delete(@Param('id', new ParseEnumPipe(Role)) name: Role) {
    await this.rolesService.delete(name);
  }

  @ApiOperation({ summary: 'get role users' })
  @ApiResponse({ status: 200, type: [UserModel] })
  @Roles(Role.Reader)
  @Get(':id/users')
  async findRoleUsers(@Param('id', new ParseEnumPipe(Role)) name: Role,
                      @Query() dto: UsersQueryDto) {
    return this.rolesService.getRoleUsers(name, dto);
  }
}
