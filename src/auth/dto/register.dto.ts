import { IsEmail, IsString, MinLength, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@gmail.com',
    description: 'Correo electrónico del usuario.',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario (mínimo 6 caracteres).',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'Juanita',
    description: 'Nombre del usuario.',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    example: 'Mar',
    description: 'Apellido del usuario.',
  })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiPropertyOptional({
    example: '+584121234567',
    description: 'Teléfono del usuario.',
  })
  @IsString()
  @IsOptional()
  telefono: string;

  @ApiPropertyOptional({
    example: 'CLIENT',
    description: 'Rol asignado al usuario. Por defecto el backend asigna CLIENT.',
  })
  @IsString()
  @IsOptional()
  role: string;
}
