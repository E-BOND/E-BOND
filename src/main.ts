import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bodyParser: false,
    });

    // --- Raw Body para Webhooks ---
    app.use(
        bodyParser.json({
            verify: (req: any, res, buf) => {
                if (req.originalUrl.startsWith('/payments/webhook')) {
                    req.rawBody = buf;
                }
            },
        }),
    );
    app.use(bodyParser.urlencoded({ extended: true }));

    // --- WebSockets ---
    app.useWebSocketAdapter(new IoAdapter(app));

    // --- CORS ---
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    // --- Validation Pipes ---
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    // ==============================
    // 📌 Swagger Config
    // ==============================
    const config = new DocumentBuilder()
        .setTitle('API Documentation')
        .setDescription('Endpoints disponibles en la API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT ?? 3000;
    await app.listen(port);

    console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
    console.log(`📘 Documentación de Swagger disponible en http://localhost:${port}/api`);
}

bootstrap();
