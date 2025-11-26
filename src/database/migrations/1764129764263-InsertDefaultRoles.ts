import { MigrationInterface, QueryRunner } from 'typeorm';

// ASEGÚRATE DE USAR EL NOMBRE DE CLASE GENERADO EN TU ARCHIVO
export class InsertDefaultRoles1700000000000 implements MigrationInterface {
    
    // El método 'up' se ejecuta cuando se aplica la migración.
    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('Inserting default roles: Admin (1) and Usuario (2)');

        await queryRunner.query(
            // Inserta los roles 1 y 2. ON CONFLICT previene errores si la tabla ya tiene datos.
            `INSERT INTO "roles" ("id", "nombre", "descripcion") 
             VALUES (1, 'Administrador', "Acceso completo a la aplicación."),
                    (2, 'Usuario', "Acceso básico a la aplicación.")
             ON CONFLICT ("id") DO NOTHING;`
        );
    }

    // El método 'down' se ejecuta si se revierte la migración.
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM "roles" WHERE "id" IN (1, 2);`
        );
        console.log('Successfully removed default roles.');
    }

}