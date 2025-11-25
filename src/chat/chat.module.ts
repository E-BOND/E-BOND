import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ProductModule } from '../product/product.module';
import { OrderModule } from '../order/order.module';
import { PaymentMethodModule } from '../pay-methods/pay-method.module';

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET');
                console.log('🔑 SECRETO EN CHAT MODULE:', secret);
                
                if (!secret) {
                    throw new Error('JWT_SECRET no está definido en las variables de entorno');
                }
                return {
                    secret,
                    signOptions: { 
                        expiresIn: configService.get<number>('JWT_EXPIRES_IN') || '1d',
                    },
                };
            },
            inject: [ConfigService],
        }),
        ProductModule, 
        OrderModule, 
        PaymentMethodModule, 
    ],
    providers: [ChatGateway, ChatService],
    exports: [ChatGateway],
})
export class ChatModule {}