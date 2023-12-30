import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as uuid from 'uuid';
import { ConfigService } from '../config/config.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(private config: ConfigService) {}

  async save(file: Express.Multer.File) {
    const filename = uuid.v4() + this.extractFileExtension(file.originalname);

    try {
      await fs.writeFile(path.join(this.config.SERVE_STATIC_PATH, filename), file.buffer);
      return filename;
    } catch (error) {
      Logger.error(error.message, FilesService.name);
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(filename: string) {
    try {
      await fs.unlink(path.join(this.config.SERVE_STATIC_PATH, filename));
    } catch (error) {
      Logger.error(error.message, FilesService.name);
      throw new InternalServerErrorException(error.message);
    }
  }

  extractFileExtension(filename: string): string {
    const extension = filename.match(/(\.\w{1,5}$)/igm)?.at(0);
    if (!extension) {
      throw new BadRequestException('filename has no extension');
    }
    return extension;
  }
}
