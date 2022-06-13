import { Module } from '@nestjs/common';
import { DiamondModeGateway } from './diamond-meet.gateway';

@Module({
  providers: [DiamondModeGateway],
})
export class DiamondModeModule {}
