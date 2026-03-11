import { IsString, Length, Matches } from "class-validator";

export class VerifyPhoneCodeDto {
  @IsString()
  @Matches(/^\+?[0-9]{9,15}$/, {
    message: "phoneNumber must be a valid phone number",
  })
  phoneNumber!: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]{6}$/, {
    message: "code must be a 6 digit string",
  })
  code!: string;
}
