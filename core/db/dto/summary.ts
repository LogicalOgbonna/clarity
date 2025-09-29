import {string, url, enum as zEnum, object, number} from 'zod';

export class SummaryDto {
  public static summaryRequestSchema = object({
    link: url(),
    type: zEnum(['privacy', 'terms']),
    userId: string().min(1, 'User ID is required'),
    chatId: string(),
    message: string(),
  });

  public static summaryByPolicyIdSchema = object({
    policyId: number().int().positive('Valid policy ID is required'),
    userId: string().min(1, 'User ID is required'),
  });
}
