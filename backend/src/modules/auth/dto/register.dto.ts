import { IsEmail, IsPhoneNumber, IsString, MinLength, Matches, Length, IsNumberString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'nguyenvanA', description: 'Username' })
    @IsString()
    @MinLength(3, { message: 'Username must be at least 3 characters' })
    username: string;

    @ApiProperty({ example: 'abc@example.com', description: 'Email address' })
    @IsString({message: 'Email must be a string'})
    @IsEmail()
    email: string;

    @ApiProperty({ example: '0912345678', description: 'Phone number' })
    @IsNumberString({}, {message: 'Phone number must be a string'})
    @Length(9, 12, { message: 'Phone number must be between 9 and 12 characters' })
    @IsNotEmpty({ message: 'Phone number must not be empty' })
    phonenumber: string;

    @ApiProperty({ example: 'Abc12345', description: 'Password' })
    @IsString({message: 'Password must be a string'})
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number'})
    password: string;

    @ApiProperty({ example: 'Abc12345', description: 'Confirm password' })
    @IsString()
    @MinLength(6, { message: 'Confirm password must be at least 6 characters' })
    confirmpassword: string;
}
