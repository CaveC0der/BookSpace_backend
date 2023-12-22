import { FileService } from './file.service';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs/promises';
import { BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

describe('FileService', () => {
  let service: FileService;

  beforeAll(async () => {
    jest.spyOn(Logger, 'error').mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: ConfigService,
          useValue: { SERVE_STATIC_PATH: 'SERVE_STATIC_PATH' },
        },
      ],
    }).compile();

    service = module.get(FileService);
  });

  describe('save', () => {
    it('normal', async () => {
      jest.spyOn(fs, 'writeFile').mockImplementationOnce(async () => undefined);

      expect(typeof (await service.save({ originalname: 'originalname.png' } as Express.Multer.File)))
        .toBe('string');
    });

    it('writeFile failed', async () => {
      jest.spyOn(fs, 'writeFile').mockImplementationOnce(async () => { throw new Error('writeFile'); });

      await expect(service.save({ originalname: 'originalname.png' } as Express.Multer.File))
        .rejects.toThrow(InternalServerErrorException);
    });

    it('filename without extension', async () => {
      jest.spyOn(fs, 'writeFile').mockImplementationOnce(async () => undefined);

      await expect(service.save({ originalname: 'originalname' } as Express.Multer.File))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('normal', async () => {
      jest.spyOn(fs, 'unlink').mockImplementationOnce(async () => undefined);

      await expect(service.delete('originalname.png')).resolves.toBeUndefined();
    });

    it('unlink failed', async () => {
      jest.spyOn(fs, 'unlink').mockImplementationOnce(async () => { throw new Error('unlink'); });

      await expect(service.delete('originalname.png')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
