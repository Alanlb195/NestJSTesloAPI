import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from "bcryptjs";
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {


  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async create(createUserDto: CreateUserDto) {

    try {

      const { password, ...rest } = createUserDto;

      const user = this.userRepository.create({
        ...rest,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user);


      delete user.password;

      return {
        ...user,
        token: this.getJwt({ id: user.id })
      }

    } catch (error) {
      this.handleDbErrors(error);
    }

  }


  async loginUser(loginUserDto: LoginUserDto) {

    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: {
        email: email
      },
      select: {
        email: true,
        password: true,
        id: true,
      }
    });

    if (!user)
      throw new UnauthorizedException('Credentials are not valid (email)');


    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)');


    return {
      ...user,
      token: this.getJwt({ id: user.id })
    }

  }

  checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwt({ id: user.id })
    }
  }


  private getJwt(payload: JwtPayload) {

    const token = this.jwtService.sign(payload);
    return token;

  }


  private handleDbErrors(error: any): never {

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    console.log(error);

    throw new InternalServerErrorException('Please check server logs')

  }

}
