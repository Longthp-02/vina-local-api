import { Module } from "@nestjs/common";
import { VendorsController } from "./vendors.controller";
import { PlaceholderVendorSummaryProvider } from "./summary/placeholder-vendor-summary.provider";
import { VENDOR_SUMMARY_PROVIDER } from "./summary/vendor-summary.provider";
import { VendorSummaryService } from "./summary/vendor-summary.service";
import { VendorsService } from "./vendors.service";

@Module({
  controllers: [VendorsController],
  providers: [
    VendorsService,
    VendorSummaryService,
    {
      provide: VENDOR_SUMMARY_PROVIDER,
      useClass: PlaceholderVendorSummaryProvider,
    },
  ],
  exports: [VendorSummaryService],
})
export class VendorsModule {}
