import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';

export interface UploadResult {
  fileKey: string;
  fileUrl: string;
  fileHash: string;
}

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor(private readonly config: ConfigService) {
    this.endpoint = config.get<string>('S3_ENDPOINT', 'http://localhost:9000');
    this.bucket = config.get<string>('S3_BUCKET', 'nutrio-uploads');

    this.client = new S3Client({
      endpoint: this.endpoint,
      region: config.get<string>('S3_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: config.get<string>('S3_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: config.get<string>('S3_SECRET_KEY', 'minioadmin'),
      },
      forcePathStyle: true,
    });
  }

  async upload(buffer: Buffer, key: string, mimeType: string): Promise<UploadResult> {
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        Metadata: { fileHash },
      }),
    );

    const fileUrl = `${this.endpoint}/${this.bucket}/${key}`;
    return { fileKey: key, fileUrl, fileHash };
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn });
  }
}
