import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
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

  // REGISTER
  async register(userDTO: RegisterDto) {
    if (userDTO.password !== userDTO.confirmpassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUserByEmail = await this.usersService.findByEmail(userDTO.email);
    if (existingUserByEmail) {
      throw new BadRequestException('Email already exists');
    }

    const existingUserByPhone = await this.usersService.findByPhoneNumber(
      userDTO.phonenumber,
    );
    if (existingUserByPhone) {
      throw new BadRequestException('Phone number already exists');
    }

    const hashedPassword = await bcrypt.hash(userDTO.password, 10);

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

  // LOGIN
  async validateUser(identifier: string, password: string) {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    const user = isEmail
      ? await this.usersService.findByEmail(identifier)
      : await this.usersService.findByPhoneNumber(identifier);

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return null;
    }

    // ❗ Không trả password
    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phonenumber,
      role: user.role,
    };
  }

  // JWT
  generateToken(user: any) {
    const payload = {
      sub: user.id,
      role: user.role,
    };

    return {
      message: 'Đăng nhập thành công',
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  // LOGIN API
  async login(identifier: string, password: string) {
    const user = await this.validateUser(identifier, password);
    if (!user) {
      throw new UnauthorizedException('Sai email/phone hoặc mật khẩu');
    }

    return this.generateToken(user);
  }
}
