import { Module } from '@nestjs/common';
import { ConfigModule as DefaultConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { BookModule } from './book/book.module';
import { TokenModule } from './token/token.module';
import { RoleModule } from './role/role.module';
import { ReviewModule } from './review/review.module';
import { CommentModule } from './comment/comment.module';
import { GenreModule } from './genre/genre.module';
import { SequelizeModule } from '@nestjs/sequelize';
import UserModel from './user/user.model';
import TokenModel from './token/token.model';
import BookModel from './book/book.model';
import { ViewModel } from './book/view.model';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import ReviewModel from './review/review.model';
import CommentModel from './comment/comment.model';
import { ConfigService } from './config/config.service';
import { JwtModule } from '@nestjs/jwt';
import { FileModule } from './file/file.module';
import { ThrottlerModule } from '@nestjs/throttler';
import GenreModel from './genre/genre.model';
import { BookGenreModel } from './genre/book-genre.model';
import RoleModel from './role/role.model';
import { UserRoleModel } from './role/user-role.model';
import { ConfigValidationSchema } from './shared/joi/config-validation-schema';

@Module({
  imports: [
    DefaultConfigModule.forRoot({
      validationSchema: ConfigValidationSchema,
      cache: true,
    }),
    ConfigModule,
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...config.SEQUELIZE_OPTIONS,
        models: [
          UserModel, TokenModel, RoleModel, UserRoleModel, BookModel,
          GenreModel, BookGenreModel, ViewModel, ReviewModel, CommentModel,
        ],
        // autoLoadModels: true,
        // sync: { force: true },
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [config.THROTTLER_OPTIONS],
    }),
    JwtModule,
    AuthModule,
    UserModule,
    BookModule,
    TokenModule,
    RoleModule,
    ReviewModule,
    CommentModule,
    GenreModule,
    FileModule,
  ],
})
export class AppModule {}
