import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import dbConfig from './config/db.config';
import { ProjectNameModule } from './modules/project-name/project-name.module';
import { TaskManagementModule } from './modules/task-management/task-management.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MessageModule } from './modules/task-management/message/message.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TaskManagementModule,
  
    MulterModule.register({
      dest: './uploads', // Destination directory for uploaded files
    }),

    // ProjectNameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
// Established connection to database

export const dbConnection = new DataSource(dbConfig());
dbConnection
  .initialize()
  .then(() => {
    console.log(`Data Source has been initialized! `);
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });
