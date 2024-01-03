import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import AuthGuard from '../../auth/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/public.decorator';
import UserModel from '../user.model';
import DeleteDto from '../../shared/classes/delete.dto';
import RolesGuard from '../../roles/roles.guard';
import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';
import RoleDto from '../../roles/dtos/role.dto';

@ApiTags('users')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'unauthorized' })
@ApiResponse({ status: 403, description: 'forbidden' })
@ApiResponse({ status: 404, description: 'user not found' })
@ApiResponse({ status: 400, description: 'invalid data provided' })
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'get user (public)' })
  @ApiResponse({ status: 200, type: UserModel })
  @Public()
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.safeGetById(id);
  }

  @ApiOperation({ summary: 'delete user (admin)' })
  @Roles([Role.Admin])
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number,
                   @Query() dto: DeleteDto) {
    await this.usersService.delete(id, dto.hard);
  }

  @ApiOperation({ summary: 'restore user (admin)' })
  @Roles([Role.Admin])
  @Post(':id')
  async restore(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.restore(id);
  }

  @ApiOperation({ summary: 'delete user avatar (admin)' })
  @Roles([Role.Admin])
  @Delete(':id/avatar')
  async deleteUserAvatar(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.deleteAvatar(id);
  }

  @ApiOperation({ summary: 'add role (admin)' })
  @Roles([Role.Admin])
  @Post(':id/roles')
  async addRole(@Param('id', ParseIntPipe) id: number,
                @Query() dto: RoleDto) {
    await this.usersService.addRole(id, dto.name);
  }

  @ApiOperation({ summary: 'exclude role (admin)' })
  @Roles([Role.Admin])
  @Delete(':id/roles')
  async excludeRole(@Param('id', ParseIntPipe) id: number,
                    @Query() dto: RoleDto) {
    await this.usersService.excludeRole(id, dto.name);
  }
}
