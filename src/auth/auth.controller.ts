/**
 * Controlador encargado de gestionar la autenticación y recuperación de acceso.
 *
 * Incluye los endpoints para:
 * - Registro de usuarios
 * - Verificación de correo
 * - Inicio de sesión
 * - Solicitud y ejecución de restablecimiento de contraseña
 *
 * Todas las rutas en este controlador son públicas, por lo que NO requieren autenticación JWT.
 */

import {
  Controller,
  Post,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ============================================================
  // Registro de usuario
  // ============================================================

  /**
   * Registra un nuevo usuario en el sistema.
   *
   * Esta ruta es pública y no requiere token.
   */
  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    description:
      'Crea un nuevo usuario en el sistema y envía un correo de verificación.',
  })
  @ApiBody({
    type: RegisterDto,
    required: true,
    examples: {
      ejemplo: {
        summary: 'Registro exitoso',
        value: {
          nombre: 'Diosa',
          apellido: 'Pérez',
          email: 'Diosa@gmail.com',
          telefono: '30463634447',
          password: 'MiClaveSegura123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado correctamente.',
    content: {
      'application/json': {
        example: {
          message: 'Usuario registrado exitosamente. Revisa tu correo para verificar tu cuenta.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o el usuario ya existe.',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ============================================================
  // Verificación de correo electrónico
  // ============================================================

  /**
   * Verifica la cuenta del usuario mediante el token enviado al correo.
   *
   * Esta ruta es pública.
   */
  @Public()
  @Get('verify')
  @ApiOperation({
    summary: 'Verificar correo electrónico',
    description:
      'Verifica la cuenta del usuario utilizando el token enviado al correo.',
  })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Token enviado al correo del usuario.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({
    status: 200,
    description: 'Correo verificado exitosamente.',
    content: {
      'application/json': {
        example: {
          message: 'Correo verificado correctamente.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido o expirado.',
  })
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // ============================================================
  // Inicio de sesión
  // ============================================================

  /**
   * Realiza el inicio de sesión y devuelve un token JWT.
   *
   * Ruta pública.
   */
  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Permite a un usuario autenticarse y recibir un token JWT para futuras solicitudes.',
  })
  @ApiBody({
    type: LoginDto,
    required: true,
    examples: {
      ejemplo: {
        summary: 'Inicio de sesión exitoso',
        value: {
          email: 'Diosa@gmail.com',
          password: 'MiClaveSegura123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso.',
    content: {
      'application/json': {
        example: {
          message: 'Login exitoso.',
          token: 'jwt-token-aquí',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales incorrectas.',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // ============================================================
  // Solicitud de restablecimiento de contraseña
  // ============================================================

  /**
   * Envía un token al correo del usuario para restablecer su contraseña.
   *
   * Ruta pública.
   */
  @Public()
  @Post('request-reset')
  @ApiOperation({
    summary: 'Solicitar restablecimiento de contraseña',
    description:
      'Envía un correo al usuario con un token para restablecer su contraseña.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'Diosa@gmail.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Se envió un correo con instrucciones de restablecimiento.',
    content: {
      'application/json': {
        example: {
          message:
            'Se ha enviado un correo con las instrucciones para restablecer tu contraseña.',
        },
      },
    },
  })
  requestReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  // ============================================================
  // Vista temporal para validar token de restablecimiento
  // ============================================================

  /**
   * Endpoint temporal para validar un token de restablecimiento.
   *
   * No realiza cambios, solo confirma que el token fue recibido.
   */
  @Public()
  @Get('reset-password')
  @ApiOperation({
    summary: 'Validar token de restablecimiento (ruta temporal)',
    description:
      'Valida que el token de restablecimiento fue recibido. No cambia la contraseña.',
  })
  @ApiQuery({
    name: 'token',
    required: true,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({
    status: 200,
    description: 'Token recibido correctamente.',
  })
  showResetPasswordPage(@Query('token') token: string) {
    return {
      status: 'OK',
      message:
        'Ruta temporal de prueba para restablecimiento recibida.',
      instruccion:
        'Ahora, debes usar la ruta POST para ejecutar el cambio de contraseña.',
      token_recibido: token,
    };
  }

  // ============================================================
  // Restablecer la contraseña
  // ============================================================

  /**
   * Permite establecer una nueva contraseña mediante token.
   *
   * Ruta pública.
   */
  @Public()
  @Post('reset-password')
  @ApiOperation({
    summary: 'Restablecer contraseña',
    description:
      'Cambia la contraseña del usuario utilizando un token válido.',
  })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      ejemplo: {
        summary: 'Restablecimiento exitoso',
        value: {
          token: 'token-de-restablecimiento',
          newPassword: 'NuevaClaveSegura123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente.',
    content: {
      'application/json': {
        example: {
          message: 'La contraseña ha sido actualizada correctamente.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido o expirado.',
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
