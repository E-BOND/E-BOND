import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @MinLength(3)
    nombre: string;

    @IsOptional()
    @IsString()
    descripcion?: string;
}
