import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({ example: 'abc@gmail.com', description: 'User email address' })
    @IsEmail({}, { message: 'Invalid email address' })
    @IsNotEmpty({ message: 'Please provide an email address' })
    email: string;

    
}
