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
import { UserService } from './user.service';
import { Role } from '../role/role.enum';
import { Roles } from '../role/decorators/roles.decorator';
import UserUpdateDto from './dtos/user-update.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { TokenPayloadT } from '../token/types/token-payload.type';
import { TokenPayload } from '../token/decorators/token-payload.decorator';
import AuthGuard from '../auth/guards/auth.guard';
import RolesGuard from '../role/guards/roles.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import RoleDto from '../role/dtos/role.dto';
import { Public } from '../auth/decorators/public.decorator';
import UserModel from './user.model';
import DeleteDto from '../../common/classes/delete.dto';
import toBoolean from '../../common/utils/toBoolean';

@ApiTags('user')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'unauthorized' })
@ApiResponse({ status: 403, description: 'forbidden' })
@ApiResponse({ status: 404, description: 'user not found' })
@ApiResponse({ status: 400, description: 'invalid data provided' })
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'get user (public)' })
  @ApiResponse({ type: UserModel })
  @Public()
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    return this.userService.safeGetById(id);
  }

  @ApiOperation({ summary: 'update user' })
  @Roles(Role.Reader)
  @Put()
  async update(@TokenPayload('id') id: number,
               @Body() dto: UserUpdateDto) {
    await this.userService.update(id, dto);
  }

  @ApiOperation({ summary: 'delete user' })
  @Roles(Role.Reader)
  @Delete()
  async delete(@TokenPayload('id') id: number) {
    await this.userService.delete(id);
  }

  @ApiOperation({ summary: 'delete user (admin)' })
  @Roles(Role.Admin)
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number,
                   @Query() dto: DeleteDto) {
    await this.userService.delete(id, toBoolean(dto.hard));
  }

  @ApiOperation({ summary: 'restore user (admin)' })
  @Roles(Role.Admin)
  @Post(':id')
  async restore(@Param('id', ParseIntPipe) id: number) {
    await this.userService.restore(id);
  }

  @ApiOperation({ summary: 'set avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { img: { type: 'file', format: 'binary' } } } })
  @Roles(Role.Reader)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('img'))
  async setAvatar(@TokenPayload('id') id: number,
                  @UploadedFile() file: Express.Multer.File) {
    await this.userService.setAvatar(id, file);
  }

  @ApiOperation({ summary: 'delete avatar' })
  @Roles(Role.Reader)
  @Delete('avatar')
  async deleteAvatar(@TokenPayload('id') id: number) {
    await this.userService.deleteAvatar(id);
  }

  @ApiOperation({ summary: 'delete avatar (admin)' })
  @Roles(Role.Admin)
  @Delete(':id/avatar')
  async deleteUserAvatar(@TokenPayload() payload: TokenPayloadT,
                         @Param('id', ParseIntPipe) id: number) {
    await this.userService.deleteAvatar(id);
  }

  @ApiOperation({ summary: 'add role (admin)' })
  @Roles(Role.Admin)
  @Post(':id/roles')
  async addRole(@Param('id', ParseIntPipe) id: number,
                @Query() dto: RoleDto) {
    await this.userService.addRole(id, dto.name);
  }

  @ApiOperation({ summary: 'exclude role (admin)' })
  @Roles(Role.Admin)
  @Delete(':id/roles')
  async excludeRole(@Param('id', ParseIntPipe) id: number,
                    @Query() dto: RoleDto) {
    await this.userService.excludeRole(id, dto.name);
  }
}
