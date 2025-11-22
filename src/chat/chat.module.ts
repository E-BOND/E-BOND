import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ProductModule } from '../product/product.module';
import { OrderModule } from '../order/order.module';
import { PaymentMethodModule } from '../pay-methods/pay-method.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' }
    }),
    ProductModule,         // <--- Proporciona ProductService
    PaymentMethodModule,   // <--- Proporciona PaymentMethodService
    OrderModule,           // <--- Proporciona OrderService
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway],
})
export class ChatModule {}
