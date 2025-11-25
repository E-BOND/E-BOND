import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/entities/user.entity';
import { MailModule } from './mail/mail.module';
import { JwtStrategy } from './providers/jwt.strategy';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        console.log('🔑 SECRETO CARGADO EN AUTH MODULE:', secret);
        
        if (!secret) {
          throw new Error('JWT_SECRET no está definido en las variables de entorno');
        }
        return {
          secret,
          signOptions: { 
            expiresIn: '1d'
          },
        };
      },
      inject: [ConfigService],
    }),
    MailModule,
    RoleModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}