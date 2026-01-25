import { Module } from '@nestjs/common';
import { S3Module } from './s3/s3module';
import { ImagesService } from './images.service';

@Module({
    imports: [S3Module],
    providers: [ImagesService],
    exports: [ImagesService]
})
export class ImagesModule { }
