import {object, string, infer as InferType, url, date, array, number} from 'zod';

export class PolicyDto {
  public static createPolicyDto = object({
    domain: string().min(1),
    link: url(),
    type: string().min(1),
    version: string().min(1),
    content: string().min(1),
    datePublished: date(),
    company: string().nullable(),
    tagIds: array(number().int().positive()).optional(),
  });

  public static idDto = object({
    domain: string().min(1),
    type: string().min(1),
    version: string().min(1),
  });

  public static createPolicyRequestDto = object({
    link: url(),
    domain: url(),
    type: string().min(1),
    timeoutMs: string().optional(),
    waitFor: string().optional(),
  });
}

export {type InferType};
