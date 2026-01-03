import { IsEmail, IsString, Matches, Length, MinLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Email must be a string' })
  @IsEmail()
  email: string;
  @IsString({ message: 'Phone number must be a string' })
  @Length(9, 12, {
    message: 'Phone number must be between 9 and 12 characters',
  })
  @Matches(/^[0-9]+$/, { message: 'Phone number must contain only digits' })
  phonenumber: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;
}
