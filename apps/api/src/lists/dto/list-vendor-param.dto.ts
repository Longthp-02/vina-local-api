import { IsString } from "class-validator";

export class ListVendorParamDto {
  @IsString()
  id!: string;

  @IsString()
  vendorId!: string;
}
