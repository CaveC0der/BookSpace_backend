import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Put,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RolesService } from './roles.service';
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

@ApiTags('roles')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'unauthorized' })
@ApiResponse({ status: 403, description: 'forbidden' })
@ApiResponse({ status: 404, description: 'role not found' })
@ApiResponse({ status: 400, description: 'invalid data provided' })
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @ApiOperation({ summary: 'get roles (public)' })
  @ApiResponse({ status: 200, type: [RoleModel] })
  @Public()
  @Get()
  async getAll() {
    return this.rolesService.getAll();
  }

  @ApiOperation({ summary: 'get role' })
  @ApiResponse({ status: 200, type: RoleModel })
  @Public()
  @Get(':id')
  async get(@Param('id', new ParseEnumPipe(Role)) name: Role) {
    return this.rolesService.get(name);
  }

  @ApiOperation({ summary: 'update role (admin)' })
  @Roles([Role.Admin])
  @Put(':id')
  async update(@Param('id', new ParseEnumPipe(Role)) name: Role,
               @Body() dto: RoleUpdateDto) {
    await this.rolesService.update(name, dto.description);
  }

  @ApiOperation({ summary: 'get role users' })
  @ApiResponse({ status: 200, type: [UserModel] })
  @Public()
  @Get(':id/users')
  async findRoleUsers(@Param('id', new ParseEnumPipe(Role)) name: Role,
                      @Query() dto: UsersQueryDto) {
    return this.rolesService.getRoleUsers(name, dto);
  }
}
