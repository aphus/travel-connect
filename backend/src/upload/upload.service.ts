import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
  uploadImage(
    file: Express.Multer.File,
    folderName: string = 'travel_connect',
  ): Promise<any> {
    if (!file?.buffer) {
      throw new BadRequestException('File tải lên không hợp lệ');
    }

    this.configureCloudinary();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderName },
        (error, result) => {
          if (error) {
            console.error(
              'Cloudinary upload failed:',
              error instanceof Error ? error.message : error,
            );
            return reject(error);
          }

          if (!result) {
            return reject(new Error('Cloudinary không trả kết quả upload'));
          }

          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    if (!publicId?.trim()) {
      return null;
    }

    this.configureCloudinary();

    try {
      return await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
      });
    } catch (error) {
      console.error(
        'Cloudinary deletion failed:',
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }

  private configureCloudinary() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}
