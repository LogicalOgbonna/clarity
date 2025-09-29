import TagRepository from '@/db/repository/tag';
import {TagDto, type InferType} from '@/db/dto/tag';
import {type tag as Tag} from '@prisma/client';
import {type Prisma} from '@prisma/client';

export class TagService {
  /**
   * Creates a new tag in the database.
   * @param data - The tag data to be created
   * @returns A promise that resolves to the newly created tag
   */
  static async create(data: InferType<typeof TagDto.createTagDto>): Promise<Tag> {
    return TagRepository.create(data);
  }

  /**
   * Creates multiple tags in the database. If a tag already exists, returns the existing tag.
   * @param data - The tags data to be created
   * @returns A promise that resolves to an array of created/existing tags
   */
  static async createMany(data: InferType<typeof TagDto.createTagsDto>): Promise<Tag[]> {
    return TagRepository.createMany(data);
  }

  /**
   * Creates tags if they don't exist, or returns existing tag IDs.
   * This is the main method for handling tag creation/retrieval.
   * @param tagNames - Array of tag names to create or find
   * @returns A promise that resolves to an array of tag IDs
   */
  static async createOrGetTagIds(tagNames: string[]): Promise<number[]> {
    if (!tagNames || tagNames.length === 0) {
      return [];
    }

    // Remove duplicates and filter out empty strings
    const uniqueTagNames = [...new Set(tagNames.filter((name) => name.trim().length > 0))];

    if (uniqueTagNames.length === 0) {
      return [];
    }

    try {
      // Use createMany with upsert - it handles both creation and retrieval
      const tags = await TagRepository.createMany({names: uniqueTagNames});

      // Return the IDs
      return tags.map((tag) => tag.id);
    } catch (error) {
      console.error('Error creating or getting tag IDs:', error);
      throw error;
    }
  }

  /**
   * Finds a tag by its ID.
   * @param data - The tag ID to find
   * @returns A promise that resolves to the tag if found
   */
  static async findByID(data: InferType<typeof TagDto.idDto>): Promise<Tag> {
    return TagRepository.findByID(data);
  }

  /**
   * Finds a tag by its name.
   * @param data - The tag name to find
   * @returns A promise that resolves to the tag if found, null otherwise
   */
  static async findByName(data: InferType<typeof TagDto.nameDto>): Promise<Tag | null> {
    return TagRepository.findByName(data);
  }

  /**
   * Finds tags by their names.
   * @param names - Array of tag names to find
   * @returns A promise that resolves to an array of found tags
   */
  static async findByNames(names: string[]): Promise<Tag[]> {
    return TagRepository.findByNames(names);
  }

  /**
   * Updates a tag in the database.
   * @param data - The tag ID to update
   * @param tag - The tag data to be updated
   * @returns A promise that resolves to the updated tag
   */
  static async update(
    data: InferType<typeof TagDto.idDto>,
    tag: Partial<InferType<typeof TagDto.createTagDto>>
  ): Promise<Tag> {
    return TagRepository.update(data, tag);
  }

  /**
   * Deletes a tag from the database.
   * @param data - The tag ID to delete
   * @returns A promise that resolves to the deleted tag
   */
  static async delete(data: InferType<typeof TagDto.idDto>): Promise<Tag> {
    return TagRepository.delete(data);
  }

  /**
   * Finds tags by any criteria.
   * @param where - The criteria to find tags by
   * @returns A promise that resolves to an array of found tags
   */
  static async findByAny(where: Prisma.tagWhereInput): Promise<Tag[]> {
    return TagRepository.findByAny(where);
  }
}
