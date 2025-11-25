import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  WsException, 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger, ExecutionContext } from '@nestjs/common';
import { ChatService } from './chat.service';
import { WsJwtAuthGuard } from '../auth/gateways/auth.gateway';

// -------------------------------------------------
// 1. INTERFACES Y PROPIEDADES
// ---------------------------------------------------------------------

interface ChatContext {
    currentStep: string;
    comparisonProducts?: string[];
}

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/ecommerce-chat'
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(ChatGateway.name);
    
    @WebSocketServer()
    server: Server;

    private chatContexts = new Map<string, ChatContext>();
    private readonly authGuard: WsJwtAuthGuard; // Instancia del Guard

    private readonly MAIN_MENU_OPTIONS = [
        'Consultar disponibilidad de productos',
        'Comparar productos', 
        'Consultar garantías',
        'Consultar Metodos de pago',
        'Consultar Historial de Órdenes'
    ];

    // ---------------------------------------------------------------------
    // 2. CONSTRUCTOR (Inyección de Dependencias)
    // ---------------------------------------------------------------------

    constructor(
        private jwtService: JwtService,
        private chatService: ChatService
    ) {
        this.authGuard = new WsJwtAuthGuard(this.jwtService);
    }

    // ---------------------------------------------------------------------
    // 3. CICLO DE VIDA (handleConnection, handleDisconnect)
    // ---------------------------------------------------------------------

    async handleConnection(client: Socket) {
        const context = { currentStep: 'welcome' };
        this.chatContexts.set(client.id, context);
      
      
        client.data.user = { sub: 'guest', email: 'guest@example.com' }; 

        this.logger.log(`Cliente ${client.id} conectado.`);

        // Mensaje de bienvenida
        client.emit('bot_message', {
            type: 'welcome',
            message: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?',
            options: this.MAIN_MENU_OPTIONS
        });
    }

    handleDisconnect(client: Socket) {
        this.chatContexts.delete(client.id);
        this.logger.log(`Cliente desconectado: ${client.id}`);
    }

    // ---------------------------------------------------------------------
    // 4. MANEJADOR PRINCIPAL DE MENSAJES
    // ---------------------------------------------------------------------

    @SubscribeMessage('customer_message')
    async handleCustomerMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { message: string; option?: number }
    ) {
        const context = this.chatContexts.get(client.id);
        if (!context) return;
        
        // Manejar el retorno al menú con el texto "menu"
        if (data.message && data.message.toLowerCase() === 'menu') {
            return this.sendMainMenu(client);
        }

        try {
            switch (context.currentStep) {
                case 'welcome':
                    await this.handleWelcomeResponse(client, data, context);
                    break;
                case 'product_availability':
                    await this.handleProductAvailability(client, data.message, client.data.user.sub, context);
                    break;
                case 'product_comparison':
                    await this.handleProductComparison(client, data.message, context);
                    break;
                case 'warranty_info':
                    await this.handleWarrantyInfo(client, data.message, context);
                    break;
                default:
                    this.handleGeneralInquiry(client);
            }
        } catch (error) {
            this.logger.error('Error procesando mensaje:', error);
            client.emit('bot_message', {
                type: 'error',
                message: 'Lo siento, hubo un error procesando tu solicitud. Escribe "menu" para reiniciar.'
            });
            context.currentStep = 'welcome';
        }
    }

    // ---------------------------------------------------------------------
    // 5. MANEJADOR DE OPCIONES (handleWelcomeResponse)
    // ---------------------------------------------------------------------

    private async handleWelcomeResponse(client: Socket, data: any, context: ChatContext) {
        const option = data.option;

        switch (option) {
            case 0: // Consultar disponibilidad
                context.currentStep = 'product_availability';
                client.emit('bot_message', { message: '¿Qué producto te interesa consultar? Por favor ingresa el nombre del producto.' });
                break;
            case 1: // Comparar productos
                context.currentStep = 'product_comparison';
                context.comparisonProducts = [];
                client.emit('bot_message', { message: 'Ingresa el nombre del primer producto que quieres comparar:' });
                break;
            case 2: // Consultar garantías
                context.currentStep = 'warranty_info';
                client.emit('bot_message', { message: '¿De qué producto quieres consultar la garantía? Ingresa el nombre:' });
                break;
            case 3: // Consultar métodos de pago
                await this.handlePaymentMethods(client);
                break;
            case 4: // Historial de Órdenes (REQUIERE AUTENTICACIÓN)
                
                try {
                    // 1. Simular el contexto de ejecución para el Guard
                    const executionContext = {
                        switchToWs: () => ({ getClient: () => client }),
                    } as ExecutionContext;
                    
                    // 2. Ejecutar el Guard. Esto verifica el token y adjunta el 'user' al 'client'.
                    await this.authGuard.canActivate(executionContext);
                    
                    // 3. Si el Guard pasa, usamos la información del usuario
                    const customerId = (client as any).user.sub;
                    await this.handleOrderHistory(client, customerId, context);
                    
                } catch (error) {
                    // 4. Si el Guard falla (token inválido/ausente)
                    if (error instanceof WsException) {
                        client.emit('bot_message', {
                            type: 'auth_required',
                            message: 'Debes iniciar sesión con un token JWT válido para consultar tu historial de órdenes. Selecciona otra opción.'
                        });
                        this.sendMainMenu(client);
                    } else {
                        // Manejar otros errores
                        throw error;
                    }
                }
                break;
            default:
                this.sendMainMenu(client);
        }
    }

    // ---------------------------------------------------------------------
    // 6. IMPLEMENTACIÓN DE FUNCIONALIDADES
    // ---------------------------------------------------------------------

    private async handleOrderHistory(client: Socket, customerId: string, context: ChatContext) {
               
        const history = await this.chatService.getCustomerOrderHistory(customerId);
        
        client.emit('bot_message', {
            type: 'order_history',
            message: history.message,
            totalOrders: history.totalOrders,
            totalSpent: history.totalSpent,
            recentOrders: history.recentOrders,
            favoriteCategory: history.favoriteCategory
        });

        this.sendMainMenu(client);
    }

    private async handlePaymentMethods(client: Socket) {
        const paymentMethodsInfo = await this.chatService.getPaymentMethodsInfo();
        
        client.emit('bot_message', {
            type: 'payment_methods',
            message: paymentMethodsInfo.message,
            methods: paymentMethodsInfo.methods,
            securityInfo: paymentMethodsInfo.securityInfo
        });

        this.sendMainMenu(client);
    }
    
    private async handleProductAvailability(client: Socket, productQuery: string, customerId: string, context: ChatContext) { 
        if (!productQuery) {
            client.emit('bot_message', { message: 'Por favor, introduce el nombre del producto para consultar.' });
            return;
        }
        const result = await this.chatService.checkProductAvailability(productQuery, customerId);
        client.emit('bot_message', { 
            type: 'product_availability', 
            message: result.message, 
            product: result.product 
        });
        this.sendMainMenu(client);
    }

    private async handleProductComparison(client: Socket, productQuery: string, context: ChatContext) {
        if (!productQuery) {
            client.emit('bot_message', { message: 'Por favor, introduce un nombre de producto válido.' });
            return;
        }
        if (!context.comparisonProducts) context.comparisonProducts = [];

        context.comparisonProducts.push(productQuery);

        if (context.comparisonProducts.length === 1) {
            client.emit('bot_message', { message: 'Ahora ingresa el segundo producto para comparar:' });
            return;
        }

        const result = await this.chatService.compareProducts(context.comparisonProducts);
        client.emit('bot_message', { type: 'product_comparison', message: result.message, products: result.products });
        context.comparisonProducts = [];
        this.sendMainMenu(client);
    }

    private async handleWarrantyInfo(client: Socket, productQuery: string, context: ChatContext) {
        if (!productQuery) {
            client.emit('bot_message', { message: 'Por favor, introduce el nombre del producto para la garantía.' });
            return;
        }
        const warrantyInfo = await this.chatService.getWarrantyInfoForChat(productQuery);
        client.emit('bot_message', { type: 'warranty_info', message: warrantyInfo.message, warranty: warrantyInfo.warranty });
        this.sendMainMenu(client); 
    }
    
    private handleGeneralInquiry(client: Socket) {
        this.sendMainMenu(client);
    }
    
    // ---------------------------------------------------------------------
    // 7. MÉTODOS AUXILIARES
    // ---------------------------------------------------------------------

    private sendMainMenu(client: Socket) {
        client.emit('bot_message', {
            type: 'options',
            message: '¿En qué más puedo ayudarte? Selecciona una opción:',
            options: this.MAIN_MENU_OPTIONS
        });
        this.chatContexts.get(client.id)!.currentStep = 'welcome';
    }
}