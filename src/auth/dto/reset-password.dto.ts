import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token recibido por correo para restablecer la contraseña.',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'nuevaContraSegura123',
    description: 'Nueva contraseña del usuario (mínimo 6 caracteres).',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
