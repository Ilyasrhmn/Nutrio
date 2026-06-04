import { Module, Global, Logger } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

const logger = new Logger('CacheModule');

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const ttl = configService.get<number>('CACHE_TTL', 300);
        const ttlMs = ttl * 1000;

        // Use Redis only if REDIS_URL is explicitly set and is not localhost
        if (redisUrl && !redisUrl.includes('localhost') && !redisUrl.includes('127.0.0.1')) {
          try {
            const { redisStore } = await import('cache-manager-redis-yet');
            logger.log('Using Redis cache store');
            return { store: redisStore, url: redisUrl, ttl: ttlMs };
          } catch (err) {
            logger.warn(`Redis store failed to load, falling back to memory cache: ${err}`);
          }
        } else {
          logger.log('Using in-memory cache store (no REDIS_URL or localhost detected)');
        }

        return { ttl: ttlMs };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
