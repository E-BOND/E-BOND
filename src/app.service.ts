import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '¡BIENVENIDOS SOMOS E-BOND!';
  }
}
