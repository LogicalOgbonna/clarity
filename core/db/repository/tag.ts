import {type tag as Tag} from '@prisma/client';
import {type Prisma} from '@prisma/client';

import {db} from '@/db';
import {TagDto, type InferType} from '@/db/dto/tag';

class TagRepository extends TagDto {
  static async create(tag: InferType<typeof TagDto.createTagDto>): Promise<Tag> {
    try {
      const data = TagDto.createTagDto.parse(tag);
      return db.tag.create({data});
    } catch (error) {
      throw error;
    }
  }

  static async createMany(tags: InferType<typeof TagDto.createTagsDto>): Promise<Tag[]> {
    try {
      const data = TagDto.createTagsDto.parse(tags);

      // Use upsert for each tag to handle existing tags gracefully
      const upsertPromises = data.names.map((name) =>
        db.tag.upsert({
          where: {name},
          update: {},
          create: {name},
        })
      );

      return Promise.all(upsertPromises);
    } catch (error) {
      throw error;
    }
  }

  static async findByID(data: InferType<typeof TagDto.idDto>): Promise<Tag> {
    try {
      const {id} = TagDto.idDto.parse(data);
      return db.tag.findUniqueOrThrow({where: {id}});
    } catch (error) {
      throw error;
    }
  }

  static async findByName(data: InferType<typeof TagDto.nameDto>): Promise<Tag | null> {
    try {
      const {name} = TagDto.nameDto.parse(data);
      return db.tag.findUnique({where: {name}});
    } catch (error) {
      throw error;
    }
  }

  static async findByNames(names: string[]): Promise<Tag[]> {
    try {
      return db.tag.findMany({where: {name: {in: names}}});
    } catch (error) {
      throw error;
    }
  }

  static async findByAny(where: Prisma.tagWhereInput): Promise<Tag[]> {
    try {
      return db.tag.findMany({where});
    } catch (error) {
      throw error;
    }
  }

  static async update(
    data: InferType<typeof TagDto.idDto>,
    tag: Partial<InferType<typeof TagDto.createTagDto>>
  ): Promise<Tag> {
    try {
      const id = TagDto.idDto.parse(data);
      const updateData = TagDto.createTagDto.partial().parse(tag);
      // Filter out undefined values for Prisma
      const filteredData = Object.fromEntries(Object.entries(updateData).filter(([_, value]) => value !== undefined));
      return db.tag.update({
        where: {id: id.id},
        data: filteredData,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(data: InferType<typeof TagDto.idDto>): Promise<Tag> {
    try {
      const {id} = TagDto.idDto.parse(data);
      return db.tag.delete({where: {id}});
    } catch (error) {
      throw error;
    }
  }
}

export default TagRepository;
