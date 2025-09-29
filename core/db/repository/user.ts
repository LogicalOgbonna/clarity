import {type user as User} from '@prisma/client';
import {type Prisma} from '@prisma/client';

import {db} from '@/db';
import {UserDto, type InferType} from '@/db/dto/user';

class UserRepository extends UserDto {
  static async create(user: InferType<typeof UserDto.createUserDto>): Promise<User> {
    try {
      const data = UserDto.createUserDto.parse(user);
      // Filter out undefined values for Prisma
      const filteredData = Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== undefined)) as any;
      return db.user.create({data: filteredData});
    } catch (error) {
      throw error;
    }
  }

  static async findByID(data: InferType<typeof UserDto.idDto>): Promise<User> {
    try {
      const {id} = UserDto.idDto.parse(data);
      return db.user.findUniqueOrThrow({where: {id}});
    } catch (error) {
      throw error;
    }
  }

  static async findByBrowserId(data: InferType<typeof UserDto.findByBrowserIdDto>): Promise<User | null> {
    try {
      const {browserId} = UserDto.findByBrowserIdDto.parse(data);
      return db.user.findUnique({where: {browserId}});
    } catch (error) {
      throw error;
    }
  }

  static async update(
    data: InferType<typeof UserDto.idDto>,
    user: InferType<typeof UserDto.updateUserDto>
  ): Promise<User> {
    try {
      const {id} = UserDto.idDto.parse(data);
      const updateData = UserDto.updateUserDto.parse(user);
      // Filter out undefined values for Prisma
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      ) as any;
      return db.user.update({
        where: {id},
        data: filteredData,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(data: InferType<typeof UserDto.idDto>): Promise<User> {
    try {
      const {id} = UserDto.idDto.parse(data);
      return db.user.delete({where: {id}});
    } catch (error) {
      throw error;
    }
  }

  static async findByAny(where: Prisma.userWhereInput): Promise<User[]> {
    try {
      return db.user.findMany({
        where,
        orderBy: {createdAt: 'desc'},
      });
    } catch (error) {
      throw error;
    }
  }
}

export default UserRepository;
