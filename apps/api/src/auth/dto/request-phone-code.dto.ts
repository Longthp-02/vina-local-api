import { IsString, Matches } from "class-validator";

export class RequestPhoneCodeDto {
  @IsString()
  @Matches(/^\+?[0-9]{9,15}$/, {
    message: "phoneNumber must be a valid phone number",
  })
  phoneNumber!: string;
}
