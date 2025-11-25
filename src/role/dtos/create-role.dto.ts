import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty({
        example: 'ADMIN',
        description: 'Nombre del rol. Debe tener al menos 3 caracteres.',
        minLength: 3,
    })
    @IsString()
    @MinLength(3)
    nombre: string;

    @ApiPropertyOptional({
        example: 'Rol con permisos administrativos',
        description: 'Descripción del rol (opcional)',
    })
    @IsOptional()
    @IsString()
    descripcion?: string;
}
