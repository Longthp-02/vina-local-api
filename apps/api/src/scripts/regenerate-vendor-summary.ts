import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { VendorSummaryService } from "../vendors/summary/vendor-summary.service";

async function main() {
  const vendorId = process.argv[2];

  if (!vendorId) {
    throw new Error(
      "Please provide a vendorId. Example: pnpm --filter api run summary:vendor:regenerate -- <vendorId>",
    );
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const summaryService = app.get(VendorSummaryService);
    const result = await summaryService.triggerRegeneration(vendorId);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

void main();
