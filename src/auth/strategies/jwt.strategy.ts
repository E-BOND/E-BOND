import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    
    // Validar ANTES de pasar al super()
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }
    
    console.log('--- SECRETO EN JWT STRATEGY:', secret);
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Token inválido');
    }

    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}