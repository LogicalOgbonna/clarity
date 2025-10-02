import {type policy as Policy, type Prisma} from '@prisma/client';

import {db} from '@/db';
import {PolicyDto, type InferType} from '@/db/dto/policy';

class PolicyRepository extends PolicyDto {
  static async create(policy: InferType<typeof PolicyDto.createPolicyDto>): Promise<Policy> {
    try {
      const data = PolicyDto.createPolicyDto.parse(policy);
      const {tagIds, ...policyData} = data;

      // Create the policy first
      const createdPolicy = await db.policy.create({
        data: policyData,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      // Then create the tag relationships if provided
      if (tagIds && tagIds.length > 0) {
        await db.policyTag.createMany({
          data: tagIds.map((tagId) => ({
            policyId: createdPolicy.id,
            tagId: tagId,
          })),
        });

        // Return the policy with updated tag relationships
        return db.policy.findUniqueOrThrow({
          where: {id: createdPolicy.id},
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
        });
      }

      return createdPolicy;
    } catch (error) {
      throw error;
    }
  }

  static async update({
    id,
    policy,
  }: {
    id: InferType<typeof PolicyDto.idDto>;
    policy: Partial<InferType<typeof PolicyDto.createPolicyDto>>;
  }): Promise<Policy> {
    try {
      const hostname_type_version = PolicyDto.idDto.parse(id);
      const data = PolicyDto.createPolicyDto.parse(policy);
      return db.policy.update({
        where: {hostname_type_version},
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id: InferType<typeof PolicyDto.idDto>): Promise<Policy> {
    try {
      const hostname_type_version = PolicyDto.idDto.parse(id);
      return db.policy.delete({where: {hostname_type_version}});
    } catch (error) {
      throw error;
    }
  }

  static async findByID(id: InferType<typeof PolicyDto.idDto>): Promise<Policy> {
    try {
      const hostname_type_version = PolicyDto.idDto.parse(id);
      return db.policy.findUniqueOrThrow({
        where: {hostname_type_version},
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async findByAny({
    where,
    select,
  }: {
    where: Prisma.policyWhereInput;
    select: Prisma.policySelect;
  }): Promise<Policy[]> {
    try {
      return db.policy.findMany({where, select, orderBy: {createdAt: 'desc'}});
    } catch (error) {
      throw error;
    }
  }
}

export default PolicyRepository;
