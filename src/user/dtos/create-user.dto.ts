import { IsString, IsEmail, MinLength, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'Juanita', description: 'Nombre del usuario' })
    @IsString()
    nombre: string;

    @ApiProperty({ example: 'Mar', description: 'Apellido del usuario' })
    @IsString()
    apellido: string;

    @ApiProperty({ example: 'correo@ejemplo.com', description: 'Correo electrónico del usuario' })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ example: '+56912345678', description: 'Teléfono del usuario (opcional)' })
    @IsOptional()
    @IsString()
    telefono?: string;

    @ApiProperty({ example: '123456', description: 'Contraseña del usuario (mínimo 6 caracteres)' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({ example: 1, description: 'ID del rol asignado al usuario (opcional)' })
    @IsOptional()
    @IsNumber()
    roleId?: number;
}
