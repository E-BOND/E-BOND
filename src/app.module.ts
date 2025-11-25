import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CategoryModule } from './category/category.module';
import { InvoiceModule } from './invoice/invoice.module';
import { OrderModule } from './order/order.module';
import { OrderDetailModule } from './order-detail/order-detail.module';
import { PaymentModule } from './payment/payment.module';
import { PaymentMethodModule } from './pay-methods/pay-method.module';
import { ProductModule } from './product/product.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { CartModule } from './cart/cart.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { StripeModule } from './stripe/stripe.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1111',
      database: 'taller5',
      autoLoadEntities: true,
      synchronize: true,
    }),

    AuthModule, // IMPORTANTE: AuthModule debe estar ANTES que los demás
    CategoryModule,
    InvoiceModule,
    OrderModule,
    OrderDetailModule,
    PaymentModule,
    PaymentMethodModule,
    ProductModule,
    RoleModule,
    UserModule,
    CartModule,
    ChatModule,
    StripeModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}