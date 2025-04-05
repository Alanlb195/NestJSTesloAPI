import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { diskStorage } from 'multer';

import { fileNamer, fileFilter } from 'src/common/helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {

  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) { }


  @Get('product/:imageName')
  @ApiResponse({ status: 200, description: 'Return image URL' })
  @ApiParam({
    name: 'imageName',
    description: 'Nombre del archivo de imagen',
    type: String,
    example: 'example.jpg',
  })
  findProductImage(
    @Param('imageName') imageName: string,
    @Res() res: Response
  ) {

    const path = this.filesService.getStaticProductImage(imageName);

    res.sendFile(path)

  }


  @Post('product')
  @ApiResponse({ status: 200, description: 'Return image URL' })
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: { fieldSize: 100 } // limit of size
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File
  ) {

    if (!file) throw new BadRequestException('Make sure that the file is an image');

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`

    return { secureUrl }
  }

}
