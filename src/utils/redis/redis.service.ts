import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async put(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (ttl) {
      await this.redisClient.set(key, stringValue, 'EX', ttl);
    } else {
      await this.redisClient.set(key, stringValue);
    }
  }

  async clearCache(pattern: string): Promise<void> {
    const keys = await this.scanForKeys(pattern);

    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }

  private async scanForKeys(pattern: string): Promise<string[]> {
    let cursor = '0';
    const keys: string[] = [];

    do {
      const reply = await this.redisClient.scan(cursor, 'MATCH', pattern);
      cursor = reply[0];
      keys.push(...reply[1]);
    } while (cursor !== '0');

    return keys;
  }
}
