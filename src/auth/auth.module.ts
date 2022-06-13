import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

const JWT_MODULE_EXPORT = JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    secret: config.get('JWT_SECRET'),
  }),
});

@Module({
  imports: [JWT_MODULE_EXPORT],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JWT_MODULE_EXPORT],
})
export class AuthModule {}
