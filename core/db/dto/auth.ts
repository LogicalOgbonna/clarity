import {object, string} from 'zod';

export class AuthDto {
  public static signupDto = object({
    browserId: string().min(1, 'Browser ID is required'),
    email: string().min(1, 'Email is required'),
    password: string().min(1, 'Password is required'),
    name: string().min(1, 'Name is required'),
  });

  public static signinDto = object({
    email: string().min(1, 'Email is required'),
    password: string().min(1, 'Password is required'),
  });
}