import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { mkdirSync } from "fs";
import { UPLOADS_DIR, UPLOADS_PREFIX } from "./uploads/uploads.constants";
import { AppModule } from "./app.module";

async function bootstrap() {
  mkdirSync(UPLOADS_DIR, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useStaticAssets(UPLOADS_DIR, {
    prefix: UPLOADS_PREFIX,
  });

  const config = new DocumentBuilder()
    .setTitle("Vinal Local API")
    .setDescription("API documentation")
    .setVersion("0.1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  const port = configService.get<number>("PORT", 3000);
  await app.listen(port);
}
void bootstrap();
