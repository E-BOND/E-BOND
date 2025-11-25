import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dtos/create-user.dto';
import { RoleService } from '../role/role.service'; 

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
        private readonly roleService: RoleService, 
    ) {}

    async findAll(): Promise<User[]> {
        return this.usersRepo.find({ relations: ['role'] });
    }

    async findOne(id: number): Promise<User> {
        const user = await this.usersRepo.findOne({ where: { id }, relations: ['role'] });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }

    async update(id: number, dto: UpdateUserDto, currentUser?: User) {
        const user = await this.findOne(id); 

        if (currentUser && currentUser.role.nombre !== 'ADMIN') {
            if ('roleId' in dto) {
                delete dto.roleId;
            }
        }

        if (dto.password) {
            dto.password = await argon2.hash(dto.password);
        }

        if (dto.roleId) {
            const newRoleEntity = await this.roleService.findOne(dto.roleId);
            user.role = newRoleEntity;
            user.roleId = dto.roleId;
            delete dto.roleId;
        }

        Object.assign(user, dto);
        return this.usersRepo.save(user);
    }

    async create(dto: CreateUserDto) {
        const roleId = dto.roleId || 2;
        
        const roleEntity = await this.roleService.findOne(roleId);
        const hashedPassword = await argon2.hash(dto.password);
        
        const user = this.usersRepo.create({
            nombre: dto.nombre,
            apellido: dto.apellido,
            email: dto.email,
            telefono: dto.telefono,
            password: hashedPassword,
            roleId: roleEntity.id,
            role: roleEntity,
        });
        
        return this.usersRepo.save(user);
    }
    
    async delete(id: number) {
        const user = await this.findOne(id);
        
        if (user.role.nombre === 'ADMIN') {
            throw new ForbiddenException('No se puede eliminar un administrador');
        }
        
        await this.usersRepo.delete({ id });
        return { message: 'Usuario eliminado correctamente' };
    }
}