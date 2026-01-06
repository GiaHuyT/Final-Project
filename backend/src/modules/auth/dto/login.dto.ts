import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @IsString({ message: "Email hoắc số điện thoại không hợp lệ"})
  @IsNotEmpty({ message: "Vui lòng nhập email hoặc số điện thoại"})
  identifier: string;
  
  @IsString({ message: "Mật khẩu phải là chuỗi ký tự"})
  @IsNotEmpty({ message: "Vui lòng nhập mật khẩu"})
  password: string;
}