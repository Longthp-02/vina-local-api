import { IsString } from "class-validator";

export class ListIdParamDto {
  @IsString()
  id!: string;
}
