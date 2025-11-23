import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket, 
  OnGatewayConnection, 
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';

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

    private readonly MAIN_MENU_OPTIONS = [
        'Consultar disponibilidad de productos',
        'Comparar productos', 
        'Consultar garantías',
        'Consultar Metodos de pago',
        'Consultar Historial de Órdenes'
    ];

    constructor(
        private jwtService: JwtService,
        private chatService: ChatService
    ) {}

    // --- Lógica Auxiliar ---
    
    private sendMainMenu(client: Socket) {
        client.emit('bot_message', {
            type: 'options',
            message: '¿En qué más puedo ayudarte? Selecciona una opción:',
            options: this.MAIN_MENU_OPTIONS
        });
        this.chatContexts.get(client.id)!.currentStep = 'welcome';
    }

    // --- Ciclo de Vida y Autenticación ---

    async handleConnection(client: Socket) {
        const context = { currentStep: 'welcome' };
        this.chatContexts.set(client.id, context);

        try {
            // LECTURA DEL TOKEN DE client.handshake.auth
            const token = client.handshake.auth.token as string;
            
            if (!token || token === 'AQUÍ_DEBE_IR_TOKEN_JWT_VALIDO') {
                 throw new Error('Token no proporcionado o placeholder.');
            }

            const payload = await this.jwtService.verifyAsync(token);
            client.data.user = payload; 
            this.logger.log(`Usuario ${payload.sub} conectado y autenticado.`);
            
        } catch (error) {
            this.logger.warn(`Conexión de ${client.id} en modo Invitado: ${error.message}`);
            client.data.user = { sub: 'guest', email: 'guest@example.com' }; 
            client.emit('error', 'Autenticación fallida o en modo Invitado. El historial de órdenes no estará disponible.');
        }

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

    // --- Manejo de Mensajes ---

    @SubscribeMessage('customer_message')
    async handleCustomerMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { message: string; option?: number }
    ) {
        const context = this.chatContexts.get(client.id);
        if (!context) return;
        
        const customerId = client.data.user?.sub || 'guest'; 
        
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
                    // Usar data.message para la consulta de producto
                    await this.handleProductAvailability(client, data.message, customerId, context);
                    break;
                case 'product_comparison':
                    // Usar data.message para la consulta de producto
                    await this.handleProductComparison(client, data.message, context);
                    break;
                case 'warranty_info':
                    // Usar data.message para la consulta de producto
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

    // --- Manejadores del Flujo de Opciones (welcome) ---

    private async handleWelcomeResponse(client: Socket, data: any, context: ChatContext) {
        const option = data.option;
        const customerId = client.data.user?.sub;

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
                await this.handlepayMethos(client, context); 
                break;
            case 4: // Historial de Órdenes
                await this.handleOrderHistory(client, customerId, context);
                break;
            default:
                this.sendMainMenu(client);
        }
    }

    // --- Implementación de Funcionalidades (Opciones 3 y 4) ---

    private async handlepayMethos(client: Socket, context: ChatContext) {
        const paymentMethodsInfo = await this.chatService.getPaymentMethodsInfo();
        
        client.emit('bot_message', {
            type: 'payment_methods',
            message: paymentMethodsInfo.message,
            methods: paymentMethodsInfo.methods,
            securityInfo: paymentMethodsInfo.securityInfo
        });

        this.sendMainMenu(client);
    }
    
    private async handleOrderHistory(client: Socket, customerId: string, context: ChatContext) {
        if (!customerId || customerId === 'guest') {
            client.emit('bot_message', {
                type: 'auth_required',
                message: 'Debes iniciar sesión con un token JWT válido para consultar tu historial de órdenes. Selecciona otra opción.'
            });
            return this.sendMainMenu(client);
        }

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
    
    // --- Manejadores del Flujo Secundario (Disponibilidad, Comparación, Garantía) ---

    private async handleProductAvailability(client: Socket, productQuery: string, customerId: string, context: ChatContext) { 
        if (!productQuery) {
            client.emit('bot_message', { message: 'Por favor, introduce el nombre del producto para consultar.' });
            return;
        }
        // Llamada simulada
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
}