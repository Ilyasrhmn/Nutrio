import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LlmService } from '../ai/llm.service';

export interface RagResult {
  answer: string;
  sources: string[];
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly llmService: LlmService,
  ) {}

  async query(question: string): Promise<RagResult> {
    const chunks = await this.findChunks(question);
    const context = chunks.map((c: any) => `[${c.source_pasal}]\n${c.content_chunk}`).join('\n\n');
    const sources = chunks.map((c: any) => c.source_pasal).filter(Boolean);

    const result = await this.llmService.generate(
      'Kamu adalah asisten BGN (Badan Gizi Nasional) yang membantu vendor dan staf program MBG. Jawab berdasarkan konteks yang diberikan. Jika tidak ada informasi relevan, katakan demikian.',
      `Pertanyaan: ${question}\n\nKonteks:\n${context || '(tidak ada dokumen relevan ditemukan)'}`,
      { feature: 'rag_query' },
    );

    return { answer: result.text, sources: result.sources ?? sources };
  }

  async proactive(feature: string): Promise<RagResult> {
    const keywords: Record<string, string> = {
      eligibility: 'dokumen syarat vendor',
      onboarding: 'persiapan operasional dapur',
      checkpoint: 'standar foto checkpoint',
      debrief: 'penilaian skor vendor',
      delivery: 'prosedur pengiriman makanan',
    };

    const keyword = keywords[feature] ?? feature;
    const chunks = await this.findChunks(keyword);
    const context = chunks.map((c: any) => `[${c.source_pasal}]\n${c.content_chunk}`).join('\n\n');
    const sources = chunks.map((c: any) => c.source_pasal).filter(Boolean);

    const result = await this.llmService.generate(
      'Kamu adalah asisten BGN yang memberikan tips proaktif kepada vendor MBG. Berikan 1-2 kalimat tips singkat yang relevan dengan konteks yang diberikan.',
      `Fitur: ${feature}\n\nKonteks tersedia:\n${context || '(tidak ada dokumen relevan)'}`,
      { feature: 'rag_proactive' },
    );

    return { answer: result.text, sources: result.sources ?? sources };
  }

  async ingest(docName: string, content: string, sourcePasal?: string): Promise<number> {
    const chunkSize = 500;
    const chunks: string[] = [];

    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.slice(i, i + chunkSize).trim();
      if (chunk.length > 50) chunks.push(chunk);
    }

    for (const chunk of chunks) {
      await this.dataSource.query(
        `INSERT INTO rag_documents (doc_name, content_chunk, source_pasal)
         VALUES ($1, $2, $3)`,
        [docName, chunk, sourcePasal ?? null],
      );
    }

    this.logger.log(`[rag] Ingested ${chunks.length} chunks from "${docName}"`);
    return chunks.length;
  }

  private async findChunks(keyword: string) {
    const words = keyword.split(/\s+/).filter(w => w.length > 2);
    if (words.length === 0) return [];

    const likePatterns = words.map(w => `content_chunk ILIKE '%${w.replace(/'/g, "''")}%'`).join(' OR ');

    return this.dataSource.query(
      `SELECT content_chunk, source_pasal, doc_name
       FROM rag_documents
       WHERE ${likePatterns}
       LIMIT 5`,
    );
  }
}
