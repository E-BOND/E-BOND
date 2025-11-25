import { IsOptional, IsEnum, IsString, MinLength, IsEmail, IsNumber } from 'class-validator';
import { OneToMany } from 'typeorm';
import { Role } from '../../role/entities/role.entity';


export class UpdateUserDto {
    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsString()
    apellido?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @IsOptional()
    @IsNumber()
    roleId?: number; 
}
