import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { CacheService } from '../cache/cache.service';
import { AiFeature, MOCK_LLM, MockLlmResult } from './mocks';

export interface LlmResult {
  text: string;
  sources?: string[];
}

export interface LlmContext {
  feature?: AiFeature;
  cacheKey?: string;
  cacheTtl?: number;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly client: Anthropic | null;
  private readonly isMock: boolean;
  private readonly model: string;

  constructor(
    private readonly config: ConfigService,
    private readonly cache: CacheService,
  ) {
    this.isMock = config.get<string>('AI_MOCK', 'true') === 'true';
    this.model = config.get<string>('AI_MODEL', 'claude-sonnet-4-6');

    const apiKey = config.get<string>('AI_API_KEY');
    this.client = !this.isMock && apiKey ? new Anthropic({ apiKey }) : null;
  }

  async generate(
    systemPrompt: string,
    userMessage: string,
    context: LlmContext = {},
  ): Promise<LlmResult> {
    if (this.isMock) {
      const feature = context.feature ?? 'llm_generate';
      const mock: MockLlmResult = MOCK_LLM[feature] ?? MOCK_LLM['llm_generate'];
      this.logger.debug(`[llm mock] feature=${feature}`);
      return mock;
    }

    // Check cache
    if (context.cacheKey) {
      const cached = await this.cache.get<LlmResult>(context.cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.client!.messages.create({
        model: this.model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });

      const block = response.content.find((b) => b.type === 'text');
      const text = block?.type === 'text' ? block.text : '';
      const result: LlmResult = { text };

      if (context.cacheKey) {
        await this.cache.set(context.cacheKey, result, { ttl: context.cacheTtl ?? 300 });
      }

      return result;
    } catch (error) {
      this.logger.error('[llm] API call failed', error);
      return { text: 'Respons AI tidak tersedia saat ini.' };
    }
  }
}
