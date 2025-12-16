import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
export class RegisterDto {
    @IsEmail()
    email: string;
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number'})
    password: string;
    @IsString()
    confirmPassword: string;
}
