import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = client.handshake.auth.token as string;

    if (!token) {
      throw new WsException({ type: 'auth_required', message: 'Token JWT faltante.' });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      (client as any).user = payload; 
      
      return true;
    } catch (e) {
      throw new WsException({ type: 'auth_required', message: 'Token JWT inválido o expirado.' });
    }
  }
}