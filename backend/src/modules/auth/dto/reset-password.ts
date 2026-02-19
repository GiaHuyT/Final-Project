import { IsEmail, IsPhoneNumber, IsString, MinLength, Matches, Length, IsNumberString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({ example: 'a1b2c3d4token', description: 'Token reset password' })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({ example: 'NewPassword123', description: 'New password (min 6 chars, must include uppercase, lowercase, number)' })
    @IsString()
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Mật khẩu phải bao gồm chữ hoa, chữ thường và chữ số'
    })
    newPassword: string;
}