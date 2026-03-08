import { Injectable } from "@nestjs/common";

type HealthCheckResponse = {
  status: "ok";
  service: "api";
  timestamp: string;
};

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }

  getHealth(): HealthCheckResponse {
    return {
      status: "ok",
      service: "api",
      timestamp: new Date().toISOString(),
    };
  }
}
