import { Logger, Module } from '@nestjs/common';
import { ConfigModule as DefaultConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigValidationSchema } from './shared/joi/config-validation-schema';
import UserModel from './users/user.model';
import TokenModel from './tokens/token.model';
import RoleModel from './roles/models/role.model';
import { UserRoleModel } from './roles/models/user-role.model';
import BookModel from './books/models/book.model';
import GenreModel from './genres/models/genre.model';
import { BookGenreModel } from './genres/models/book-genre.model';
import { ViewModel } from './books/models/view.model';
import ReviewModel from './reviews/review.model';
import CommentModel from './comments/comment.model';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { TokensModule } from './tokens/tokens.module';
import { RolesModule } from './roles/roles.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CommentsModule } from './comments/comments.module';
import { GenresModule } from './genres/genres.module';
import { FilesModule } from './files/files.module';

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
        logging: sql => Logger.log(sql, SequelizeModule.name),
        // autoLoadModels: true, sync: { force: true },
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [config.THROTTLER_OPTIONS],
    }),
    JwtModule,
    AuthModule,
    UsersModule,
    BooksModule,
    TokensModule,
    RolesModule,
    ReviewsModule,
    CommentsModule,
    GenresModule,
    FilesModule,
  ],
})
export class AppModule {}
