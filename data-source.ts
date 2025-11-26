import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  // **Asegúrate de que estas rutas sean correctas después de la compilación**
  entities: [__dirname + '/**/*.entity{.ts,.js}'], 
  migrations: [__dirname + '/src/database/migrations/*{.ts,.js}'], 
  ssl: {
    rejectUnauthorized: false, 
  },
});

export default dataSource;