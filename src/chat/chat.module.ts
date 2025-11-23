import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
// Estos son los módulos que contienen ProductService, OrderService, PaymentMethodService
import { ProductModule } from '../product/product.module';
import { OrderModule } from '../order/order.module';
import { PaymentMethodModule } from '../pay-methods/pay-method.module';

@Module({
    imports: [
        JwtModule.register({
            // 🚨 USAR ConfigService en lugar de process.env DIRECTAMENTE, pero para el ejemplo...
            secret: 'tu-clave-secreta-jwt-super-segura', 
            signOptions: { expiresIn: '1d' }
        }),
        ProductModule, 
        OrderModule, 
        PaymentMethodModule, 
    ],
    providers: [ChatGateway, ChatService],
    exports: [ChatGateway],
})
export class ChatModule {}
