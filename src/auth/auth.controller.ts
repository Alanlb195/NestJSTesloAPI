import { Controller, Post, Body, Get, UseGuards, Headers, SetMetadata, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, CreateUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { GetRawHeaders } from './decorators/get-headers.decorator';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { Auth, RoleProtected } from './decorators';
import { ValidRoles } from './interfaces';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  auth(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    // @Req() request: Express.Request, // * all of the request...
    // @GetRawHeaders() rawHeaders: string[], // * to get headers with a custom decorator
    @Headers() headers: IncomingHttpHeaders // * to get headers by nestjs 
  ) {
    // console.log({ user: request });
    return {
      ok: true,
      message: 'hola mundo private',
      user,
      email: userEmail,
      // rawHeaders,
      headers
    }
  }


  // Autentication: Bearer
  // Authorization: Specific role of the user
  // method to show how to set metadata using a custom decorator
  // @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user'])
  // @RoleProtected(ValidRoles.superUser)
  // @UseGuards(AuthGuard(), UserRoleGuard)
  // privateRoute2(
  //   @GetUser() user: User
  // ) {

  //   return {
  //     ok: 'true',
  //     user
  //   }
  // }

  // Autentication and authorization on the same custom decorator
  // @Get('private3')
  // @Auth(ValidRoles.superUser)
  // privateRoute3(
  //   @GetUser() user: User
  // ) {

  //   return {
  //     ok: 'true',
  //     user
  //   }
  // }


}
