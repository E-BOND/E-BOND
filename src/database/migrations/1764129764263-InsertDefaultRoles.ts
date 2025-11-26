import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertDefaultRoles1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "roles" ("id", "nombre", "descripcion")
      VALUES 
        (1, 'ADMIN', 'Acceso completo a la aplicación.'),
        (2, 'CLIENT', 'Acceso básico a la aplicación.')
      ON CONFLICT ("id") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "roles" WHERE id IN (1,2);`);
  }
}
