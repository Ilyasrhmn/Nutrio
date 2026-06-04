import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { MOCK_VISION, MockVisionResult } from './mocks';

export interface VisionValidationResult {
  pass: boolean;
  reason: string;
  confidence: number;
}

export interface VisionContext {
  feature?: string;
  cpType?: string;
  vendorId?: string;
}

@Injectable()
export class VisionService {
  private readonly logger = new Logger(VisionService.name);
  private readonly client: Anthropic | null;
  private readonly isMock: boolean;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.isMock = config.get<string>('AI_MOCK', 'true') === 'true';
    this.model = config.get<string>('AI_MODEL', 'claude-sonnet-4-6');

    const apiKey = config.get<string>('AI_API_KEY');
    this.client = !this.isMock && apiKey ? new Anthropic({ apiKey }) : null;
  }

  async validatePhoto(imageUrl: string, context: VisionContext = {}): Promise<VisionValidationResult> {
    if (this.isMock) {
      const key = context.cpType ?? 'default';
      const mock: MockVisionResult = MOCK_VISION[key] ?? MOCK_VISION['default'] ?? {
        pass: true,
        reason: 'Mock validation passed.',
        confidence: 0.9,
      };
      this.logger.debug(`[vision mock] key=${key} pass=${mock.pass}`);
      return mock;
    }

    try {
      const response = await this.client!.messages.create({
        model: this.model,
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'url', url: imageUrl },
              },
              {
                type: 'text',
                text: this.buildVisionPrompt(context),
              },
            ],
          },
        ],
      });

      const block = response.content.find((b) => b.type === 'text');
      const text = block?.type === 'text' ? block.text : '';
      return this.parseVisionResponse(text);
    } catch (error) {
      this.logger.error('[vision] API call failed, returning safe default', error);
      return { pass: false, reason: 'Validasi foto tidak dapat diselesaikan.', confidence: 0 };
    }
  }

  private buildVisionPrompt(context: VisionContext): string {
    const cpInfo = context.cpType ? ` untuk checkpoint ${context.cpType}` : '';
    return `Kamu adalah validator foto makanan untuk program MBG (Makan Bergizi Gratis)${cpInfo}.
Periksa foto ini dan tentukan apakah memenuhi standar kebersihan dan kelengkapan SOP BGN.
Jawab HANYA dalam format JSON: {"pass": true/false, "reason": "alasan singkat", "confidence": 0.0-1.0}`;
  }

  private parseVisionResponse(text: string): VisionValidationResult {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]) as VisionValidationResult;
        return {
          pass: Boolean(parsed.pass),
          reason: String(parsed.reason || ''),
          confidence: Number(parsed.confidence ?? 0.5),
        };
      }
    } catch {
      // fallthrough
    }
    return { pass: false, reason: 'Format respons AI tidak valid.', confidence: 0 };
  }
}
