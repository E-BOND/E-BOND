import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
    // Instancia de la aplicación
    const app = await NestFactory.create(AppModule, {
        bodyParser: false, // CLAVE: Desactiva el body parser built-in
    });
    
    // --- Configuración para Webhooks (Raw Body) ---
    app.use(
        bodyParser.json({
            verify: (req: any, res, buf) => {
                // Se captura el rawBody para la ruta del webhook de pagos
                if (req.originalUrl.startsWith('/payments/webhook')) {
                    req.rawBody = buf; 
                }
            },
        }),
    );
    // Re-habilitar el parser de urlencoded para el resto de las peticiones REST
    app.use(bodyParser.urlencoded({ extended: true }));

    
    // --- Configuración para WebSockets (Socket.IO) ---
    
    // Usar el adaptador de Socket.IO en la única instancia 'app'
    app.useWebSocketAdapter(new IoAdapter(app)); 

    // Definir CORS para TODA la aplicación (REST y WebSockets)
    app.enableCors({
        origin: '*', 
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    
    // --- Pipes Globales ---
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true, 
        transform: true,
    }));

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();