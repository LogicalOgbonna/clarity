import {email, string, object, number, infer as InferType} from 'zod';

export class UserDto {
  public static createUserDto = object({
    browserId: string().min(1, 'Browser ID is required'),
    name: string().optional(),
    email: email().optional(),
  });

  public static idDto = object({
    id: string().min(1, 'User ID is required'),
  });

  public static browserIdDto = object({
    browserId: string().min(1, 'Browser ID is required'),
  });

  public static updateUserDto = object({
    name: string().optional(),
    email: email().optional(),
    numberOfSummaries: number().int().min(0).optional(),
  });

  public static findByBrowserIdDto = object({
    browserId: string().min(1, 'Browser ID is required'),
  });
}

export {type InferType};
