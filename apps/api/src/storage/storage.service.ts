import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly r2Client: S3Client;

  constructor() {
    this.r2Client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadToR2(file: Buffer, key: string, contentType: string) {
    try {
      await this.r2Client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
          Body: file,
          ContentType: contentType,
        })
      );

      return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
    } catch (error) {
      this.logger.error(`R2 Upload Failure: ${error.message}`);
      throw error;
    }
  }
}
