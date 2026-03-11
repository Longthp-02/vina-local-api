import { IsString, MaxLength } from "class-validator";

export class CreateListCommentDto {
  @IsString()
  @MaxLength(500)
  content!: string;
}
