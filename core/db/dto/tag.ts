import {z} from 'zod';

export class TagDto {
  public static createTagDto = z.object({
    name: z.string().min(1, 'Tag name is required').max(100, 'Tag name must be less than 100 characters'),
  });

  public static createTagsDto = z.object({
    names: z
      .array(z.string().min(1, 'Tag name is required').max(100, 'Tag name must be less than 100 characters'))
      .min(1, 'At least one tag name is required'),
  });

  public static idDto = z.object({
    id: z.number().int().positive('ID must be a positive integer'),
  });

  public static nameDto = z.object({
    name: z.string().min(1, 'Tag name is required'),
  });
}

export type InferType<T> = z.infer<T>;
