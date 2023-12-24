import { Body, Controller, Delete, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ConfigService } from '../config/config.service';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import SignupResponseDto from './dtos/signup-response.dto';
import SignupRequestDto from './dtos/signup-request.dto';
import LoginResponseDto from './dtos/login-response.dto';
import LoginRequestDto from './dtos/login-request.dto';
import RefreshGuard from './guards/refresh.guard';
import AuthGuard from './guards/auth.guard';
import { TokenPayload } from '../tokens/decorators/token-payload.decorator';
import { Token } from '../tokens/decorators/token.decorator';

@ApiTags('auth')
@ApiResponse({ status: 401, description: 'unauthorized' })
@ApiResponse({ status: 403, description: 'forbidden' })
@ApiResponse({ status: 404, description: 'role not found' })
@ApiResponse({ status: 400, description: 'invalid data provided' })
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
              private config: ConfigService) {}

  @ApiOperation({ summary: 'signup' })
  @ApiResponse({ status: 201, type: SignupResponseDto })
  @Post('signup')
  async signup(@Body() dto: SignupRequestDto,
               @Res({ passthrough: true }) res: Response): Promise<SignupResponseDto> {
    const { dto: resDto, refreshToken } = await this.authService.signup(dto);

    res.cookie(
      this.config.COOKIE_NAME,
      refreshToken,
      {
        maxAge: this.config.COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: 'strict',
      },
    );

    return resDto;
  }

  @ApiOperation({ summary: 'login' })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  @Post('login')
  async login(@Body() dto: LoginRequestDto,
              @Res({ passthrough: true }) res: Response): Promise<LoginResponseDto> {
    const { dto: resDto, refreshToken } = await this.authService.login(dto);

    res.cookie(
      this.config.COOKIE_NAME,
      refreshToken,
      {
        maxAge: this.config.COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: 'strict',
      },
    );

    return resDto;
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'refresh' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @UseGuards(RefreshGuard)
  @Post('refresh')
  async refresh(@TokenPayload('id') id: number,
                @Token('refresh') token: string,
                @Res({ passthrough: true }) res: Response): Promise<LoginResponseDto> {
    const { dto: resDto, refreshToken } = await this.authService.refresh(id, token);

    res.cookie(
      this.config.COOKIE_NAME,
      refreshToken,
      {
        maxAge: this.config.COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: 'strict',
      },
    );

    return resDto;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'logout' })
  @UseGuards(AuthGuard)
  @Delete('logout')
  async logout(@TokenPayload('id') id: number,
               @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(id);
    res.clearCookie(this.config.COOKIE_NAME);
  }
}
