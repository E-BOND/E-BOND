import io from 'socket.io-client';
import * as readline from 'readline';

class InteractiveChatClient {
    private socket;
    private rl: readline.Interface;
    private currentOptions: string[] = [];

    constructor() {
        this.socket = io('http://localhost:81/ecommerce-chat', {
            transports: ['websocket']
        });

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.setupEventListeners();
        this.setupUserInput();
    }

    private setupEventListeners() {
        this.socket.on('connect', () => {
            console.log(`✅ Conectado al servidor de chat\n`);
            console.log(`✅ Bienvenido a  E-BOND tu tienda virtual de confianza\n`);
            console.log(` ¡Conectamos personas, productos y experiencias en tiempo real!\n`);
            console.log(`
                 _______                  ________  ________  ________   ________
                |\\  ___ \\                |\\   __  \\|\\   __  \\|\\   ___  \\|\\   ___ \\    
                \\ \\   __/|   ____________\\ \\  \\|\\ /\\ \\  \\|\\  \\ \\  \\\\ \\  \\ \\  \\_|\\ \\ 
                 \\ \\  \\_|/__|\\____________\\ \\   __  \\ \\   __  \\ \\  \\\\ \\  \\ \\  \\ \\\\ \\ 
                  \\ \\  \\_|\\ \\|____________|\\ \\  \\|\\  \\ \\  \\|\\  \\ \\  \\\\ \\  \\ \\  \\_\\\\ \\ 
                   \\ \\_______\\              \\ \\_______\\ \\_______\\ \\__\\\\ \\__\\ \\_______\\ 
                    \\|_______|               \\|_______|\\|_______|\\|__| \\|__|\\|_______|
                    `);

        });

        this.socket.on('disconnect', () => {
            console.log('❌ Desconectado del servidor');
            this.rl.close();
        });

        this.socket.on('bot_message', (data) => {
            console.log('🔧 [CLIENT DEBUG] Tipo recibido:', data.type);
            
            // Manejar métodos de pago específicamente
            if (data.type === 'payment_methods') {
                console.log('🔧 [CLIENT DEBUG] Ejecutando handlePaymentMethods');
                this.handlePaymentMethods(data);
                return;
            }

            console.log('\n🤖 BOT:', data.message);
            
            if (data.product) {
                console.log('\n📦 Información del producto:');
                console.log(`   Nombre: ${data.product.name}`);
                console.log(`   Precio: $${data.product.price}`);
                console.log(`   Descripción: ${data.product.description}`);
                console.log(`   Disponible: ${data.available ? '✅ Sí' : '❌ No'}`);
                
                if (data.stock) {
                    console.log(`   Stock: ${data.stock.quantity} unidades`);
                    console.log(`   Stock bajo: ${data.stock.lowStock ? '⚠️ Sí' : '✅ No'}`);
                }
            }

            if (data.products && data.products.length > 0) {
                console.log('\n⚖️ Comparación de productos:');
                data.products.forEach((product: any, index: number) => {
                    console.log(`\n   Producto ${index + 1}: ${product.name}`);
                    console.log(`     Precio: $${product.price}`);
                    console.log(`     Disponible: ${product.available ? '✅' : '❌'}`);
                    console.log(`     Categorías: ${product.categories?.join(', ') || 'N/A'}`);
                });
            }

            if (data.warranty) {
                console.log('\n🛡️ Información de garantía:');
                console.log(`   Duración: ${data.warranty.duration}`);
                console.log(`   Tipo: ${data.warranty.type}`);
                console.log(`   Contacto: ${data.warranty.contactSupport}`);
            }

            if (data.options) {
                this.currentOptions = data.options;
                console.log('\n📋 Opciones:');
                data.options.forEach((option: string, index: number) => {
                    console.log(`   [${index}] ${option}`);
                });
            }

            console.log('\n💬 Escribe tu mensaje o número de opción:');
        });

        this.socket.on('connect_error', (error) => {
            console.log('❌ Error de conexión:', error.message);
        });
    }

    private handlePaymentMethods(data: any) {
        console.log('\n🤖 BOT:', data.message);
        
        if (data.methods && data.methods.length > 0) {
            console.log('\n💳 Métodos de pago disponibles:');
            data.methods.forEach((method: any, index: number) => {
                console.log(`\n🔹 ${method.name}`);
                console.log(`   📝 ${method.description}`);
                
                if (method.supportedCards && method.supportedCards.length > 0) {
                    console.log(`   💳 Tarjetas aceptadas: ${method.supportedCards.join(', ')}`);
                }
                
                if (method.installments) {
                    console.log(`   📅 ${method.installments}`);
                }
                
                console.log(`   ⏱️ ${method.processingTime}`);
            });
        }

        if (data.securityInfo) {
            console.log('\n🛡️ Información de seguridad:');
            if (data.securityInfo.encrypted) console.log('   ✅ Transacciones encriptadas con SSL');
            if (data.securityInfo.fraudProtection) console.log('   ✅ Protección contra fraudes');
            if (data.securityInfo.moneyBackGuarantee) console.log('   ✅ Garantía de devolución de 30 días');
            if (data.securityInfo.sslCertified) console.log('   ✅ Certificado SSL');
        }

        if (data.options) {
            this.currentOptions = data.options;
            console.log('\n📋 Opciones:');
            data.options.forEach((option: string, index: number) => {
                console.log(`   [${index}] ${option}`);
            });
        }

        console.log('\n💬 Escribe tu mensaje o número de opción:');
    }

    private setupUserInput() {
        this.rl.on('line', (input) => {
            const trimmedInput = input.trim();
            
            if (trimmedInput === 'exit' || trimmedInput === 'quit') {
                console.log('👋 Saliendo del chat...');
                this.socket.disconnect();
                this.rl.close();
                return;
            }

            // Verificar si es un número de opción
            const optionIndex = parseInt(trimmedInput);
            if (!isNaN(optionIndex) && optionIndex >= 0 && optionIndex < this.currentOptions.length) {
                this.socket.emit('customer_message', { option: optionIndex });
            } else {
                this.socket.emit('customer_message', { message: trimmedInput });
            }
        });
    }
}

// Iniciar cliente interactivo
console.log('🚀 Iniciando cliente de chat interactivo...');
console.log('💡 Escribe "exit" o "quit" para salir\n');
new InteractiveChatClient();