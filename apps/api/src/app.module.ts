import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AdminModule } from "./admin/admin.module";
import { AuthContextMiddleware } from "./auth/auth-context.middleware";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { VendorsModule } from "./vendors/vendors.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    DatabaseModule,
    AuthModule,
    VendorsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthContextMiddleware).forRoutes({
      path: "*",
      method: RequestMethod.ALL,
    });
  }
}
