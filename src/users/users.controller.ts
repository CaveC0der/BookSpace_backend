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
import { UsersService } from './users.service';
import UserUpdateDto from './dtos/user-update.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import AuthGuard from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import UserModel from './user.model';
import DeleteDto from '../shared/classes/delete.dto';
import toBoolean from '../shared/utils/toBoolean';
import RolesGuard from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import { TokenPayload } from '../tokens/decorators/token-payload.decorator';
import RoleDto from '../roles/dtos/role.dto';

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

  @ApiOperation({ summary: 'update user' })
  @Roles(Role.Reader)
  @Put('me')
  async update(@TokenPayload('id') id: number,
               @Body() dto: UserUpdateDto) {
    await this.usersService.update(id, dto);
  }

  @ApiOperation({ summary: 'delete user' })
  @Roles(Role.Reader)
  @Delete('me')
  async delete(@TokenPayload('id') id: number) {
    await this.usersService.delete(id);
  }

  @ApiOperation({ summary: 'set avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { img: { type: 'file', format: 'binary' } } } })
  @Roles(Role.Reader)
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('img'))
  async setAvatar(@TokenPayload('id') id: number,
                  @UploadedFile() file: Express.Multer.File) {
    await this.usersService.setAvatar(id, file);
  }

  @ApiOperation({ summary: 'delete avatar' })
  @Roles(Role.Reader)
  @Delete('me/avatar')
  async deleteAvatar(@TokenPayload('id') id: number) {
    await this.usersService.deleteAvatar(id);
  }

  @ApiOperation({ summary: 'get user (public)' })
  @ApiResponse({ status: 200, type: UserModel })
  @Public()
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.safeGetById(id);
  }

  @ApiOperation({ summary: 'delete user (admin)' })
  @Roles(Role.Admin)
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number,
                   @Query() dto: DeleteDto) {
    await this.usersService.delete(id, toBoolean(dto.hard));
  }

  @ApiOperation({ summary: 'restore user (admin)' })
  @Roles(Role.Admin)
  @Post(':id')
  async restore(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.restore(id);
  }

  @ApiOperation({ summary: 'delete user avatar (admin)' })
  @Roles(Role.Admin)
  @Delete(':id/avatar')
  async deleteUserAvatar(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.deleteAvatar(id);
  }

  @ApiOperation({ summary: 'add role (admin)' })
  @Roles(Role.Admin)
  @Post(':id/roles')
  async addRole(@Param('id', ParseIntPipe) id: number,
                @Query() dto: RoleDto) {
    await this.usersService.addRole(id, dto.name);
  }

  @ApiOperation({ summary: 'exclude role (admin)' })
  @Roles(Role.Admin)
  @Delete(':id/roles')
  async excludeRole(@Param('id', ParseIntPipe) id: number,
                    @Query() dto: RoleDto) {
    await this.usersService.excludeRole(id, dto.name);
  }
}
