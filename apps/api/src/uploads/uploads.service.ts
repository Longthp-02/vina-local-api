import { BadRequestException, Injectable } from "@nestjs/common";
import { mkdir, writeFile } from "fs/promises";
import { extname, join } from "path";
import { randomUUID } from "crypto";
import { UPLOADS_DIR, UPLOADS_PREFIX } from "./uploads.constants";

export type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

export type StoredUpload = {
  url: string;
  storagePath: string;
  mimeType: string;
};

@Injectable()
export class UploadsService {
  async saveImages(
    files: UploadedImageFile[],
    folder: string,
  ): Promise<StoredUpload[]> {
    const safeFolder = folder
      .replace(/[^a-zA-Z0-9/-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const targetDir = join(UPLOADS_DIR, safeFolder);
    await mkdir(targetDir, { recursive: true });

    return Promise.all(
      files.map(async (file) => {
        this.assertIsImage(file);

        const extension = this.getExtension(file);
        const fileName = `${randomUUID()}${extension}`;
        const absolutePath = join(targetDir, fileName);
        const storagePath = `${safeFolder}/${fileName}`;

        await writeFile(absolutePath, file.buffer);

        return {
          url: `${UPLOADS_PREFIX}/${storagePath}`,
          storagePath,
          mimeType: file.mimetype,
        };
      }),
    );
  }

  private assertIsImage(file: UploadedImageFile) {
    if (!file.mimetype.startsWith("image/")) {
      throw new BadRequestException("Only image uploads are allowed.");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException("Each image must be 5MB or smaller.");
    }
  }

  private getExtension(file: UploadedImageFile): string {
    const originalExtension = extname(file.originalname || "").toLowerCase();

    if (originalExtension) {
      return originalExtension;
    }

    switch (file.mimetype) {
      case "image/jpeg":
        return ".jpg";
      case "image/png":
        return ".png";
      case "image/webp":
        return ".webp";
      case "image/heic":
        return ".heic";
      default:
        return ".jpg";
    }
  }
}
