import {UserDto} from '@/db/dto/user';
import {type user as User} from '@prisma/client';
import {UserService} from '../user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class AuthService {
  public static async signup(data: {
    browserId: string;
    name: string;
    email: string;
    password: string;
  }): Promise<{user: UserDto; token: string}> {
    try {
      const password = await bcrypt.hash(data.password, 10);
      const user = await UserService.update(
        {browserId: data.browserId},
        {
          name: data.name,
          email: data.email,
          password,
        }
      );
      const token = jwt.sign({id: user.id}, process.env.JWT_SECRET!, {expiresIn: '1y', algorithm: 'HS256'});
      return {user, token};
    } catch (error) {
      throw error;
    }
  }

  public static async signin(data: {email: string; password: string}): Promise<{user: User; token: string}> {
    try {
      const [user] = await UserService.findByAny({email: data.email});
      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (!user.password) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign({id: user.id}, process.env.JWT_SECRET!, {expiresIn: '1y', algorithm: 'HS256'});
      return {user, token};
    } catch (error) {
      throw error;
    }
  }
}

export default AuthService;
