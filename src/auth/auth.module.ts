import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { config } from 'src/constants';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    UtilsModule,
    JwtModule.register({
      secret: config.SECRET,
      signOptions: { expiresIn: config.JWT_EXPIRE_TIME },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
