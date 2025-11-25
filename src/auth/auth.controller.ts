import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // Esta ruta NO requiere token
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public() // Esta ruta NO requiere token
  @Get('verify')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Public() // Esta ruta NO requiere token
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Public() // Esta ruta NO requiere token
  @Post('request-reset')
  requestReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Public() // Esta ruta NO requiere token
  @Get('reset-password')
  showResetPasswordPage(@Query('token') token: string) {
    return { 
      status: "OK", 
      message: "Ruta temporal de prueba para restablecimiento recibida.",
      instruccion: "Ahora, debe probar la ruta POST en tu cliente HTTP (Postman/ThunderClient) para ejecutar el cambio de contraseña.",
      token_recibido: token 
    };
  }

  @Public() // Esta ruta NO requiere token
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}