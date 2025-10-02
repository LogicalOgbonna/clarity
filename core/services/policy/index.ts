import PolicyRepository from '@/db/repository/policy';
import {PolicyDto, type InferType} from '@/db/dto/policy';
import {type policy as Policy, type Prisma} from '@prisma/client';
import {createHash} from 'crypto';
import {TagService} from '@/services/tag';
import {chromium} from 'playwright';
import {JSDOM} from 'jsdom';
import {Readability} from '@mozilla/readability';
import {openai} from '@ai-sdk/openai';
import {generateObject} from 'ai';
import {object, string, array} from 'zod';
import { LLM_MODEL } from '@/utils/model';

export class PolicyService {
  /**
   * Generates a SHA-256 hash from a date in yyyy-mm-dd format
   * @param date - The date to generate hash from
   * @returns A hexadecimal hash string
   */
  static generateDateHash(date: Date): string {
    const dateString = date.toISOString().split('T')[0] || date.toISOString(); // Format: yyyy-mm-dd
    return createHash('sha256').update(dateString).digest('hex');
  }

  /**
   * Creates a new policy document in the database.
   * Automatically generates a version hash using the current date.
   * @param data - The policy data to be created
   * @returns A promise that resolves to the newly created policy document
   */
  static async create(data: InferType<typeof PolicyDto.createPolicyRequestDto>): Promise<Policy> {
    try {
      // TODO: check if the policy already exists in the database,
      // if it does, compare the createdAt date with the current parsed policy date,
      // if the current policy is older than 1 week, fetch a new one and compare their dates (comparing the hashes of their dates)

      const {link, type, timeoutMs, waitFor} = PolicyDto.createPolicyRequestDto.parse(data);
      const timeoutMsNumber = Math.min(Number(timeoutMs) || 10000, 30000);
      const {hostname} = new URL(link);

      const browser = await chromium.launch({
        args: ['--no-sandbox'],
        headless: true,
      });
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:10.0) Gecko/20100101 Firefox/10.0',
      });
      const page = await context.newPage();
      await page.goto(link, {
        waitUntil: 'domcontentloaded',
        timeout: timeoutMsNumber,
      });
      if (waitFor && waitFor.length > 0) {
        await page.waitForSelector(waitFor, {timeout: timeoutMsNumber}).catch(() => {});
      } else {
        await page.waitForLoadState('networkidle', {timeout: timeoutMsNumber}).catch(() => {});
      }

      // Get the content of the page
      const text = await page.evaluate(() => document.body?.innerText || '');

      const html = await page.content();
      const dom = new JSDOM(html, {url: link});
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      const content = article?.textContent || text;

      const {
        object: {datePublished, company, tags},
      } = await generateObject({
        model: openai.chat(LLM_MODEL),
        prompt: text,
        schema: object({
          datePublished: string().describe('The date the article was published in yyyy-mm-dd format'),
          company: string().describe('The name of the company that owns this policy'),
          tags: array(string())
            .max(2)
            .describe(
              'A list of business categories or services this company provides (maximum 4 tags, e.g., "social media", "e-commerce", "cloud computing", "fintech")'
            ),
        }),
        system: `
                You are a helpful assistant that extracts information from policy documents. 
                Extract the publication date, company name, and business categories/services. 
                Return the date in yyyy-mm-dd format, the company name as a string, and tags as an array of strings (maximum 2 tags) that best describe the company's primary business type or industry. Think carefully and select only the most relevant and specific tags that truly represent what the company does.`,
      });

      if (!datePublished) {
        throw new Error('Date published not found');
      }

      const version = this.generateDateHash(new Date(datePublished));
      // TODO: compare the version with the version of the latest policy in the database,
      // if the version is the same, return the latest policy

      // Create or get tag IDs
      const tagIds = await TagService.createOrGetTagIds(tags || []);

      return await PolicyRepository.create({
        hostname,
        link,
        type,
        version,
        content,
        datePublished: new Date(datePublished),
        company: company || null,
        tagIds: tagIds,
      });
    } catch (error) {
      console.log("🚀 ~ PolicyService ~ create ~ error:", error)
      throw error;
    }
  }

  /**
   * Finds a policy document in the database by its ID.
   * @param data - The policy ID to find
   * @returns A promise that resolves to the policy document if found
   */
  static async findByID(data: InferType<typeof PolicyDto.idDto>): Promise<Policy> {
    return PolicyRepository.findByID(data);
  }

  /**
   * Finds a policy document in the database by its numeric ID.
   * @param id - The numeric policy ID to find
   * @returns A promise that resolves to the policy document if found
   */
  static async findByNumericID(id: number): Promise<Policy> {
    return PolicyRepository.findByAny({
      where: {id},
      select: {
        id: true,
        hostname: true,
        link: true,
        type: true,
        version: true,
        content: true,
        datePublished: true,
        company: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    }).then((policies) => {
      if (policies.length === 0) {
        throw new Error(`Policy with ID ${id} not found`);
      }
      return policies[0] as Policy;
    });
  }

  /**
   * Updates a policy document in the database.
   * Automatically generates a version hash using the current date.
   * @param data - The policy ID to update
   * @param policy - The policy data to be updated
   * @returns A promise that resolves to the newly updated policy document
   */
  static async update(
    data: InferType<typeof PolicyDto.idDto>,
    policy: InferType<typeof PolicyDto.createPolicyDto>
  ): Promise<Policy> {
    const version = this.generateDateHash(new Date(policy.version));
    return PolicyRepository.update({id: data, policy: {...policy, version}});
  }

  /**
   * Deletes a policy document in the database.
   * @param data - The policy ID to delete
   * @returns A promise that resolves to the deleted policy document
   */
  static async delete(data: InferType<typeof PolicyDto.idDto>): Promise<Policy> {
    return PolicyRepository.delete(data);
  }

  public static defaultSelect: Prisma.policySelect = {
    id: true,
    hostname: true,
    link: true,
    type: true,
    version: true,
    content: false,
    datePublished: true,
    createdAt: true,
  };

  /**
   * Finds a policy document in the database by any criteria.
   * @param where - The criteria to find the policy document by
   * @returns A promise that resolves to the policy document if found
   */
  static async findByAny({
    where,
    select = this.defaultSelect,
  }: {
    where: Prisma.policyWhereInput;
    select?: Prisma.policySelect;
  }): Promise<Policy[]> {
    return PolicyRepository.findByAny({where, select});
  }
}
