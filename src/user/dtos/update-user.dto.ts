import { IsOptional, IsString, MinLength, IsEmail, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'Juanita', description: 'Nombre del usuario' })
    @IsOptional()
    @IsString()
    nombre?: string;

    @ApiPropertyOptional({ example: 'Mar', description: 'Apellido del usuario' })
    @IsOptional()
    @IsString()
    apellido?: string;

    @ApiPropertyOptional({ example: 'correo@ejemplo.com', description: 'Correo electrónico del usuario' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: '+56912345678', description: 'Teléfono del usuario' })
    @IsOptional()
    @IsString()
    telefono?: string;

    @ApiPropertyOptional({ example: '123456', description: 'Contraseña nueva (mínimo 6 caracteres)' })
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @ApiPropertyOptional({ example: 1, description: 'Nuevo ID del rol del usuario' })
    @IsOptional()
    @IsNumber()
    roleId?: number;
}
