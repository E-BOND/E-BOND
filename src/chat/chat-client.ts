import io from 'socket.io-client';
import * as readline from 'readline';

const TEST_TOKEN = process.env.CLIENT_TEST_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjgsImVtYWlsIjoiYW5naWVAZ21haWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY0MDI1NDUzLCJleHAiOjE3NjQxMTE4NTN9.zy7y5Dp643lFQbae1pRL4UvJhI_6mtxaAa_k_cwyXzE';

const HOST = process.env.HOST || 'http://localhost';
const PORT = process.env.PORT || '3000';
const CHAT_NAMESPACE = process.env.CHAT_NAMESPACE || '/ecommerce-chat'; 
const SERVER_URL = `${HOST}:${PORT}${CHAT_NAMESPACE}`;

class InteractiveChatClient {
    private socket;
    private rl: readline.Interface;
    private currentOptions: string[] = [];
    private userId: string = 'guest_user';

    constructor() {
        this.socket = io(SERVER_URL, {
            transports: ['websocket'],
            auth: {
                token: TEST_TOKEN
            }
        });

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: ''
        });

        this.setupEventListeners();
        this.rl.on('line', this.handleInput.bind(this));
    }

    private setupEventListeners() {
        this.socket.on('connect', () => {
            console.log(`✅ Conectado al servidor de chat\n`);
            console.log(`✅ Bienvenido a E-BOND tu tienda virtual de confianza\n`);
            console.log(` ¡Conectamos personas, productos y experiencias en tiempo real!\n`);
            console.log(`
                                _______                   ________  ________  ________   ________ ________ ________  ________
                               |\\  ___ \\                |\\   __  \\|\\   __  \\|\\   ___  \\|\\   ___ \\    
                               \\ \\   __/|   ____________\\ \\  \\|\\ /\\ \\  \\|\\  \\ \\  \\\\ \\  \\ \\  \\_|\\ \\ 
                                \\ \\  \\_|/__|\\____________\\ \\   __  \\ \\   __  \\ \\  \\\\ \\  \\ \\  \\ \\\\ \\ 
                                 \\ \\  \\_|\\ \\|____________|\\ \\  \\|\\  \\ \\  \\|\\  \\ \\  \\\\ \\  \\ \\  \\_\\\\ \\ 
                                  \\ \\_______\\              \\ \\_______\\ \\_______\\ \\__\\\\ \\__\\ \\_______\\ 
                                   \\|_______|               \\|_______|\\|_______|\\|__| \\|__|\\|_______|
                                   `);
        });

        this.socket.on('disconnect', (reason) => {
            console.log(`❌ Desconectado del servidor: ${reason}`);
            this.rl.close();
        });

        this.socket.on('connect_error', (error) => {
            console.log('❌ Error de conexión:', error.message);
        });

        this.socket.on('error', (message) => {
            console.log('❌ Error del servidor:', message);
        });
        
        // LÓGICA PARA MANEJAR RESPUESTAS COMPLEJAS
        this.socket.on('bot_message', (data) => {
            console.log('\n🔧 [CLIENT DEBUG] Tipo recibido:', data.type);
            
            // 1. Mostrar mensaje general si existe
            if (data.message) {
                console.log('\n🤖 BOT:', data.message);
            }

            // 2. Manejar datos estructurados
            if (data.products && data.products.length > 0) {
                console.log('\n⚖️ Comparación de productos:');
                data.products.forEach((product: any, index: number) => {
                    console.log(`\n Producto ${index + 1}: ${product.name}`);
                    console.log(` Precio: $${product.price}`);
                    console.log(` Disponible: ${product.available ? '✅' : '❌'}`);
                    console.log(` Categorías: ${product.categories || 'N/A'}`); 
                });
            }
            
            if (data.product) {
                console.log('\n📦 Información del producto:');
                console.log(` Nombre: ${data.product.name}`);
                console.log(` Precio: $${data.product.price}`);
                console.log(` Descripción: ${data.product.description}`);
                console.log(` Disponible: ${data.product.available ? '✅ Sí' : '❌ No'}`);
                
                if (data.stock) {
                    console.log(` Stock: ${data.stock.quantity} unidades`);
                    console.log(` Stock bajo: ${data.stock.lowStock ? '⚠️ Sí' : '✅ No'}`);
                }
            }

            if (data.warranty) {
                console.log('\n🛡️ Información de garantía:');
                console.log(` Duración: ${data.warranty.duration}`);
                console.log(` Tipo: ${data.warranty.type}`);
                console.log(` Contacto: ${data.warranty.contactSupport}`);
            }
            
            if (data.type === 'payment_methods' || (data.methods && data.methods.length > 0)) {
                this.handlePaymentMethods(data);
            }

            if (data.type === 'order_history' || (data.recentOrders && data.recentOrders.length > 0)) {
                this.handleOrderHistory(data);
            }
            
            // 3. Mostrar opciones si existen
            if (data.options) {
                this.currentOptions = data.options;
                console.log('\n📋 Opciones:');
                data.options.forEach((option: string, index: number) => {
                    console.log(` [${index}] ${option}`);
                });
            }

            const isDisplayingMenu = data.options && data.options.length > 0;
            const isAskingForExplicitInput = data.type === undefined && data.message;

            if (isDisplayingMenu || isAskingForExplicitInput) {
                this.rl.setPrompt('\n💬 Escribe tu mensaje o número de opción: ');
                this.rl.prompt(true);
            }
        });
    }

    private handlePaymentMethods(data: any) {
        if (data.methods && data.methods.length > 0) {
            console.log('\n💳 Métodos de pago disponibles:');
            data.methods.forEach((method: any, index: number) => {
                console.log(`\n🔹 ${method.name}`);
                console.log(`📝 ${method.description}`);
                
                if (method.supportedCards && method.supportedCards.length > 0) {
                    console.log(` 💳 Tarjetas aceptadas: ${method.supportedCards.join(', ')}`);
                }
                
                if (method.installments) {
                    console.log(` 📅 ${method.installments}`);
                }
                
                console.log(`⏱️ ${method.processingTime || 'Tiempo de procesamiento no especificado'}`);
            });
        }

        if (data.securityInfo) {
            console.log('\n🛡️ Información de seguridad:');
            if (data.securityInfo.encrypted) console.log(' ✅ Transacciones encriptadas con SSL');
            if (data.securityInfo.fraudProtection) console.log(' ✅ Protección contra fraudes');
            if (data.securityInfo.moneyBackGuarantee) console.log(' ✅ Garantía de devolución de 30 días');
            if (data.securityInfo.sslCertified) console.log('✅ Certificado SSL');
        }
    }


private handleOrderHistory(data: any) {

    const totalSpentNumber = Number(data.totalSpent) || 0; 
    
    console.log('\n📦 Historial de Órdenes:');
    console.log(` Total de pedidos: ${data.totalOrders}`);
    
  
    console.log(` Gasto total: $${totalSpentNumber.toFixed(2)}`); 
    
    console.log(` Categoría Favorita: ${data.favoriteCategory}`);
    
    if (data.recentOrders && data.recentOrders.length > 0) {
        console.log('\n Últimas 3 Órdenes:');
        data.recentOrders.forEach((order: any) => {
            const orderTotalFormatted = Number(order.total).toFixed(2);
            console.log(` - #${order.id} | Total: $${orderTotalFormatted} | Estado: ${order.status}`);
        });
    }
}
    
    private handleInput(input: string) {
        const trimmedInput = input.trim();
        
        if (trimmedInput === 'exit' || trimmedInput === 'quit') {
            console.log('👋 Saliendo del chat...');
            this.socket.disconnect();
            this.rl.close();
            return;
        }

        if (trimmedInput.toLowerCase() === 'menu') {
            this.socket.emit('customer_message', { message: 'menu' });
            return;
        }

        // 1. Emitir la entrada al servidor
        const optionIndex = parseInt(trimmedInput);
        if (!isNaN(optionIndex) && optionIndex >= 0 && optionIndex < this.currentOptions.length) {
            this.socket.emit('customer_message', { option: optionIndex });
        } else {
            this.socket.emit('customer_message', { message: trimmedInput });
        }
    }
}

// Iniciar cliente interactivo
console.log('🚀 Iniciando cliente de chat interactivo...');
console.log('💡 Escribe "exit" o "quit" para salir\n');
new InteractiveChatClient();