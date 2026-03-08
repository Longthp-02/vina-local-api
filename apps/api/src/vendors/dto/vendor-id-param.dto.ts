import { IsNotEmpty, IsString } from "class-validator";

export class VendorIdParamDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
