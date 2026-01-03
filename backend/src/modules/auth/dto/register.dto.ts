import { IsEmail, IsPhoneNumber, IsString, MinLength, Matches, Length, IsNumberString, IsNotEmpty } from 'class-validator';
export class RegisterDto {
    @IsString()
    username: string;

    @IsString({message: 'Email must be a string'})
    @IsEmail()
    email: string;

    @IsNumberString({}, {message: 'Phone number must be a string'})
    @Length(9, 12, { message: 'Phone number must be between 9 and 12 characters' })
    @IsNotEmpty({ message: 'Phone number must not be empty' })
    phonenumber: string;

    @IsString({message: 'Password must be a string'})
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number'})
    password: string;

    @IsString()
    confirmpassword: string;
}
