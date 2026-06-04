import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OpsGateway, BgnGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET', 'access-secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [OpsGateway, BgnGateway, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
