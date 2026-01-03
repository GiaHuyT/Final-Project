import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(userDTO: RegisterDto) {
    if (userDTO.password !== userDTO.confirmpassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUserByEmail = await this.usersService.findByEmail(userDTO.email);
    if (existingUserByEmail) {
      throw new BadRequestException('Email already exists');
    }
    const existingUserByPhone = await this.usersService.findByPhoneNumber(userDTO.phonenumber);
    if (existingUserByPhone) {
      throw new BadRequestException('Phone number already exists');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userDTO.password, salt);

    const user = await this.usersService.create({
      username: userDTO.username,
      email: userDTO.email,
      phonenumber: userDTO.phonenumber,
      password: hashedPassword,
    });
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return null;
    }

    // Return user không có password
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  // ⚠️ SỬA: login - giản lược lại (logic chuyển sang validateUser)
  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.generateToken(user);
  }
}
