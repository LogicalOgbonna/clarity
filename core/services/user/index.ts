import UserRepository from '@/db/repository/user';
import {UserDto, type InferType} from '@/db/dto/user';
import {type user as User} from '@prisma/client';
import {type Prisma} from '@prisma/client';
import {db} from '@/db';

export class UserService {
  /**
   * Creates a new user in the database.
   * @param data - The user data to be created
   * @returns A promise that resolves to the newly created user
   */
  static async create(data: InferType<typeof UserDto.createUserDto>): Promise<User> {
    return UserRepository.create(data);
  }

  /**
   * Finds a user by their ID.
   * @param data - The user ID to find
   * @returns A promise that resolves to the user if found
   */
  static async findByID(data: InferType<typeof UserDto.idDto>): Promise<User> {
    return UserRepository.findByID(data);
  }

  /**
   * Finds a user by their browser ID.
   * @param data - The browser ID to find
   * @returns A promise that resolves to the user if found, null otherwise
   */
  static async findByBrowserId(data: InferType<typeof UserDto.findByBrowserIdDto>): Promise<User> {
    return UserRepository.findByBrowserId(data);
  }

  /**
   * Updates a user in the database.
   * @param where - The user ID to update
   * @param user - The user data to be updated
   * @returns A promise that resolves to the updated user
   */
  static async update(
    where: Prisma.userWhereUniqueInput,
    user: Prisma.userUpdateInput
  ): Promise<User> {
    return UserRepository.update(where, user);
  }

  /**
   * Deletes a user from the database.
   * @param data - The user ID to delete
   * @returns A promise that resolves to the deleted user
   */
  static async delete(data: InferType<typeof UserDto.idDto>): Promise<User> {
    return UserRepository.delete(data);
  }

  /**
   * Finds users by any criteria.
   * @param where - The criteria to find users by
   * @returns A promise that resolves to an array of found users
   */
  static async findByAny(where: Prisma.userWhereInput): Promise<User[]> {
    return UserRepository.findByAny(where);
  }

  /**
   * Creates a user or returns existing one based on browser ID.
   * This is used when the extension is installed.
   * @param browserId - The browser ID
   * @param name - Optional user name
   * @param email - Optional user email
   * @returns A promise that resolves to the user
   */
  static async createOrGetByBrowserId(browserId: string, name?: string, email?: string): Promise<User> {
    try {
      // First try to find existing user with this browser ID
      const existingUser = await UserRepository.findByBrowserId({browserId});

      if (existingUser) {
        return existingUser;
      }

      // If no existing user found, create a new one
      return UserRepository.create({
        browserId,
        name,
        email,
      });
    } catch (error) {
      console.error('Error creating or getting user by browser ID:', error);
      throw error;
    }
  }

  /**
   * Increments the number of summaries for a user.
   * @param userId - The user ID
   * @returns A promise that resolves to the updated user
   */
  static async incrementSummaries(userId: string): Promise<User> {
    try {
      return await db.user.update({
        where: {id: userId},
        data: {numberOfSummaries: {increment: 1}},
      });
    } catch (error) {
      console.error('Error incrementing summaries:', error);
      throw error;
    }
  }
}
