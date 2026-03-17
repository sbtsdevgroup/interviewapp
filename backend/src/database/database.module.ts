import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: () => {
        const pool = new Pool({
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          database: process.env.DB_NAME || 'icbm_db',
          user: process.env.DB_USER || 'icbm_user',
          password: process.env.DB_PASSWORD || 'icbm_password',
        });

        pool.on('connect', () => {
          console.log('Connected to PostgreSQL database');
        });

        pool.on('error', (err) => {
          console.error('Unexpected error on idle client', err);
        });

        return pool;
      },
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class DatabaseModule {}

