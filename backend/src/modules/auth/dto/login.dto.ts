import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: 'abc@example.com or 0936219231' ,description: 'Email or phone number' })
  @IsString({ message: "Email or phone number must be a string"})
  @IsNotEmpty({ message: "Please provide email or phone number"})
  identifier: string;
  
  @ApiProperty({ example: 'Abc12345', description: 'Mật khẩu' })
  @IsString({ message: "Password must be a string"})
  @IsNotEmpty({ message: "Please provide password"})
  password: string;
}