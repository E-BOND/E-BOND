import { IsString, IsEmail, MinLength, IsOptional, IsNumber } from 'class-validator';

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
    @IsNumber()
    roleId?: number;
}