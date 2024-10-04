import { Injectable } from '@nestjs/common';
import { Tag } from './tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagRepository } from './tag.repository';

@Injectable()
export class TagService {
    constructor(
        private readonly tagRepository: TagRepository
    ) {}

    async createTag(createTagDto: CreateTagDto): Promise<Tag> {
        const tag = this.tagRepository.create(createTagDto);
        return this.tagRepository.save(tag);
    }

    async getTagByName(name: string): Promise<Tag> {
        return this.tagRepository.findOne({ where: { name } });
    }
}
