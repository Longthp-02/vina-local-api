import { IsOptional, IsString } from "class-validator";

export class AddVendorToListDto {
  @IsString()
  vendorId!: string;

  @IsOptional()
  @IsString()
  listId?: string;
}
