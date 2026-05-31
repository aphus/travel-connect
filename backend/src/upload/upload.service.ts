import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
    // Đã xóa hàm constructor() để tránh lỗi bất đồng bộ của NestJS

    uploadImage(file: Express.Multer.File): Promise<any> {
        return new Promise((resolve, reject) => {
            // 1. In ra Terminal để kiểm chứng chắc chắn 100% NestJS đã đọc được file .env
            console.log("🔍 KIỂM TRA BIẾN MÔI TRƯỜNG:");
            console.log("- Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
            console.log("- API Key:", process.env.CLOUDINARY_API_KEY);
            console.log("- API Secret:", process.env.CLOUDINARY_API_SECRET ? "Đã nạp thành công (Bảo mật không in ra)" : "BỊ THIẾU (undefined)");

            // 2. Ép cấu hình Cloudinary ngay tại thời điểm tải ảnh lên
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });

            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'travel_connect' },
                (error, result) => {
                    if (error) {
                        console.error("🔴 LỖI CLOUDINARY:", JSON.stringify(error, null, 2));
                        return reject(error);
                    }
                    resolve(result);
                },
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }
}