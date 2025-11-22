import { IsString, IsEmail, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
    @IsString()
    nombre: string;

    @IsString()
    apellido: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}
