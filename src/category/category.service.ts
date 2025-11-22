import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,
    ) {}

    async findAll(): Promise<Category[]> {
        return this.categoryRepo.find({ relations: ['products'] });
    }

    async findOne(id: number): Promise<Category> {
        const category = await this.categoryRepo.findOne({
        where: { id },
        relations: ['products'],
        });
        if (!category)
        throw new NotFoundException(`Category with ID ${id} not found`);
        return category;
    }

    async create(dto: CreateCategoryDto): Promise<Category> {
        const category = this.categoryRepo.create(dto);
        return this.categoryRepo.save(category);
    }

    async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findOne(id);
        Object.assign(category, dto);
        return this.categoryRepo.save(category);
    }

    async remove(id: number): Promise<{ message: string }> {
        const category = await this.findOne(id);
        await this.categoryRepo.remove(category);
        return { message: `Category ${id} deleted successfully` };
    }
}
